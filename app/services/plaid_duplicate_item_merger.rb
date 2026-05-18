# Merges a re-added (duplicate) Plaid Item back into the original one.
#
# When a bank connection breaks and is re-added through Plaid Link instead of
# being repaired via update mode, Plaid issues a brand-new Item with fresh
# account_ids and transaction_ids. That produces duplicate PlaidAccounts and
# duplicate PlaidTransactions that no uniqueness constraint can catch.
#
# This service pairs each new account with its old counterpart, deletes the
# overlapping (duplicate) transactions, re-homes the genuinely-new ones onto the
# surviving account, re-points the survivor to the working access token, and
# retires the old Item.
#
# Usage:
#   merger = PlaidDuplicateItemMerger.new(old_token: t1, new_token: t2)
#   merger.plan       # => inspect what would change (no writes)
#   merger.apply!     # => perform the merge inside a transaction
class PlaidDuplicateItemMerger
  # Amounts are floats; treat values within half a cent as equal.
  AMOUNT_EPSILON = 0.005

  class Error < StandardError; end

  AccountPlan = Struct.new(:old_account, :new_account, :duplicate_ids, :repoint_ids, keyword_init: true)
  Plan = Struct.new(:pairs, :unmatched_new_accounts, keyword_init: true) do
    def duplicate_count = pairs.sum { |p| p.duplicate_ids.size }
    def repoint_count = pairs.sum { |p| p.repoint_ids.size }
  end

  def initialize(old_token:, new_token:, date_tolerance: 3)
    raise Error, "old and new access token must be different" if old_token.id == new_token.id
    if old_token.account_id != new_token.account_id
      raise Error, "access tokens belong to different accounts"
    end

    @old_token = old_token
    @new_token = new_token
    @date_tolerance = date_tolerance
  end

  # Builds the merge plan without writing anything.
  def plan
    @plan ||= build_plan
  end

  # Executes the plan. All database changes happen in a single transaction.
  # When +remove_item+ is true the old Item is also removed from Plaid.
  def apply!(remove_item: true)
    current_plan = plan
    raise Error, "no account pairs matched between the two Items" if current_plan.pairs.empty?

    ActiveRecord::Base.transaction do
      current_plan.pairs.each { |pair| apply_pair(pair) }

      # Move the old Item's sync events onto the new token. Deleting them is not
      # an option: PlaidSyncEvent has `dependent: :destroy` on its transactions,
      # so destroying a sync event would destroy the survivor's history.
      PlaidSyncEvent.where(plaid_access_token_id: @old_token.id)
                    .update_all(plaid_access_token_id: @new_token.id)

      retire_old_item(remove_item: remove_item)
    end

    current_plan
  end

  private

  def build_plan
    old_accounts = @old_token.plaid_accounts.active.to_a
    new_accounts = @new_token.plaid_accounts.active.to_a

    pairs = []
    unmatched = []

    new_accounts.each do |new_account|
      old_account = old_accounts.find do |candidate|
        candidate.plaid_mask == new_account.plaid_mask &&
          candidate.plaid_subtype == new_account.plaid_subtype
      end

      if old_account
        pairs << build_account_plan(old_account, new_account)
      else
        unmatched << new_account
      end
    end

    Plan.new(pairs: pairs, unmatched_new_accounts: unmatched)
  end

  # Classifies the new account's transactions into duplicates (an equivalent
  # transaction already exists on the old account) and unique ones.
  def build_account_plan(old_account, new_account)
    old_txns = old_account.plaid_transactions.to_a
    new_txns = new_account.plaid_transactions.order(:date).to_a

    consumed = {}
    duplicate_ids = []
    repoint_ids = []

    new_txns.each do |new_txn|
      match = old_txns.find do |old_txn|
        !consumed[old_txn.id] && transactions_match?(old_txn, new_txn)
      end

      if match
        consumed[match.id] = true
        duplicate_ids << new_txn.id
      else
        repoint_ids << new_txn.id
      end
    end

    AccountPlan.new(
      old_account: old_account,
      new_account: new_account,
      duplicate_ids: duplicate_ids,
      repoint_ids: repoint_ids
    )
  end

  def transactions_match?(old_txn, new_txn)
    (old_txn.amount.to_f - new_txn.amount.to_f).abs < AMOUNT_EPSILON &&
      (old_txn.date.to_date - new_txn.date.to_date).abs <= @date_tolerance &&
      normalize_name(old_txn.name) == normalize_name(new_txn.name)
  end

  def normalize_name(name)
    name.to_s.downcase.gsub(/[^a-z0-9 ]/, "").gsub(/\s+/, " ").strip
  end

  def apply_pair(pair)
    old_account = pair.old_account
    new_account = pair.new_account

    # 1. Delete duplicate transactions and their tag joins.
    if pair.duplicate_ids.any?
      TagPlaidTransaction.where(plaid_transaction_id: pair.duplicate_ids).delete_all
      PlaidTransaction.where(id: pair.duplicate_ids).delete_all
    end

    # 2. Re-home the genuinely-new transactions onto the surviving account.
    if pair.repoint_ids.any?
      PlaidTransaction.where(id: pair.repoint_ids).update_all(plaid_account_id: old_account.id)
    end

    # 3. Remove the now-empty new PlaidAccount with raw deletes. Calling destroy
    #    would be catastrophic: PlaidAccount has `belongs_to :plaid_access_token,
    #    dependent: :destroy`, so it would cascade-delete the surviving token
    #    and every sibling account.
    pau_ids = new_account.plaid_accounts_users.pluck(:id)
    AccountBalance.where(plaid_accounts_user_id: pau_ids).delete_all
    PlaidAccountsUser.where(id: pau_ids).delete_all
    # `delete_all!` (acts_as_paranoid) issues a raw SQL DELETE with no callbacks:
    # it neither triggers the dangerous belongs_to cascade nor soft-deletes.
    PlaidAccount.where(id: new_account.id).delete_all!

    # 4. Re-point the survivor to the working Item, adopting the new plaid_id so
    #    future syncs match it. Safe now that the new account row is gone.
    old_account.update!(plaid_access_token_id: @new_token.id, plaid_id: new_account.plaid_id)
  end

  def retire_old_item(remove_item:)
    if remove_item
      begin
        PlaidService.new(account_id: @old_token.account_id).remove_item(@old_token.token)
      rescue => e
        Rails.logger.warn("Plaid /item/remove failed for token #{@old_token.id}: #{e.message}")
      end
    end

    @old_token.reload
    if @old_token.plaid_accounts.with_deleted.exists?
      raise Error, "old Item still has accounts attached; aborting before deleting the token"
    end

    @old_token.destroy!
  end
end
