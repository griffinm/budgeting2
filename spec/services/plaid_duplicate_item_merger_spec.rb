require 'rails_helper'

RSpec.describe PlaidDuplicateItemMerger do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }

  let(:old_token) { create(:plaid_access_token, account: account) }
  let(:new_token) { create(:plaid_access_token, account: account) }

  # Same real-world account, re-added under a new Plaid Item: identical mask and
  # subtype, but a fresh plaid_id.
  let(:old_account) do
    create(:plaid_account, account: account, plaid_access_token: old_token,
                           plaid_mask: "4321", plaid_subtype: "checking")
  end
  let(:new_account) do
    create(:plaid_account, account: account, plaid_access_token: new_token,
                           plaid_mask: "4321", plaid_subtype: "checking")
  end

  let(:old_sync_event) { create(:plaid_sync_event, account: account, plaid_access_token: old_token) }
  let(:new_sync_event) { create(:plaid_sync_event, account: account, plaid_access_token: new_token) }
  let(:merchant) { create(:merchant, account: account) }

  def txn(plaid_account, sync_event, name:, amount:, date:)
    create(:plaid_transaction,
           account: account, plaid_account: plaid_account, plaid_sync_event: sync_event,
           merchant: merchant, name: name, amount: amount, date: date)
  end

  let(:purchase_date) { Date.new(2026, 4, 10) }

  # A transaction present under both Items (a duplicate).
  let!(:old_duplicate) { txn(old_account, old_sync_event, name: "Coffee Shop", amount: -4.50, date: purchase_date) }
  let!(:new_duplicate) { txn(new_account, new_sync_event, name: "Coffee Shop", amount: -4.50, date: purchase_date) }

  # A transaction that posted only after the break — exists under the new Item.
  let!(:new_only) { txn(new_account, new_sync_event, name: "Late Groceries", amount: -88.00, date: Date.new(2026, 5, 1)) }

  # Older history that only the old Item ever saw.
  let!(:old_only) { txn(old_account, old_sync_event, name: "Old Rent", amount: -1200.00, date: Date.new(2026, 1, 1)) }

  subject(:merger) { described_class.new(old_token: old_token, new_token: new_token) }

  describe '#plan' do
    it 'pairs accounts by mask and subtype' do
      pair = merger.plan.pairs.sole
      expect(pair.old_account).to eq(old_account)
      expect(pair.new_account).to eq(new_account)
    end

    it 'classifies overlapping transactions as duplicates' do
      pair = merger.plan.pairs.sole
      expect(pair.duplicate_ids).to contain_exactly(new_duplicate.id)
    end

    it 'classifies new-Item-only transactions for re-pointing' do
      pair = merger.plan.pairs.sole
      expect(pair.repoint_ids).to contain_exactly(new_only.id)
    end

    it 'writes nothing' do
      expect { merger.plan }.not_to change(PlaidTransaction, :count)
    end
  end

  describe '#apply!' do
    before { merger.apply!(remove_item: false) }

    it 'deletes the duplicate transaction' do
      expect(PlaidTransaction.exists?(new_duplicate.id)).to be(false)
    end

    it 'keeps the original transaction' do
      expect(PlaidTransaction.exists?(old_duplicate.id)).to be(true)
    end

    it 're-homes the new-Item-only transaction onto the surviving account' do
      expect(new_only.reload.plaid_account_id).to eq(old_account.id)
    end

    it 'leaves the old account history untouched' do
      expect(old_only.reload.plaid_account_id).to eq(old_account.id)
    end

    it 're-points the surviving account to the working Item' do
      old_account.reload
      expect(old_account.plaid_access_token_id).to eq(new_token.id)
      expect(old_account.plaid_id).to eq(new_account.plaid_id)
    end

    it 'removes the duplicate account' do
      expect(PlaidAccount.with_deleted.exists?(new_account.id)).to be(false)
    end

    it 'moves the old Item sync events onto the working token' do
      expect(old_sync_event.reload.plaid_access_token_id).to eq(new_token.id)
    end

    it 'deletes the old broken access token' do
      expect(PlaidAccessToken.exists?(old_token.id)).to be(false)
    end
  end

  describe '#apply! cascade safety' do
    it 'does not delete the surviving access token or sibling accounts' do
      sibling = create(:plaid_account, account: account, plaid_access_token: new_token,
                                       plaid_mask: "9999", plaid_subtype: "savings")
      merger.apply!(remove_item: false)

      expect(PlaidAccessToken.exists?(new_token.id)).to be(true)
      expect(PlaidAccount.exists?(sibling.id)).to be(true)
    end

    it 'cleans up the duplicate account balances' do
      pau = create(:plaid_accounts_user, user: user, plaid_account: new_account)
      balance = create(:account_balance, plaid_accounts_user: pau)

      merger.apply!(remove_item: false)

      expect(AccountBalance.exists?(balance.id)).to be(false)
      expect(PlaidAccountsUser.exists?(pau.id)).to be(false)
    end
  end

  describe 'validation' do
    it 'rejects merging a token into itself' do
      expect { described_class.new(old_token: old_token, new_token: old_token) }
        .to raise_error(described_class::Error, /different/)
    end

    it 'rejects tokens from different accounts' do
      other = create(:plaid_access_token)
      expect { described_class.new(old_token: old_token, new_token: other) }
        .to raise_error(described_class::Error, /different accounts/)
    end
  end
end
