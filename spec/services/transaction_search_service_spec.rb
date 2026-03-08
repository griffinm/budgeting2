require 'rails_helper'

RSpec.describe TransactionSearchService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }

  before do
    create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
  end

  def create_transaction(attrs = {})
    create(:plaid_transaction, account: account, plaid_account: plaid_account, **attrs)
  end

  def search(params = {})
    described_class.new(account_id: account.id, user_id: user.id, **params).call
  end

  describe 'tag_ids filtering' do
    it 'returns only transactions with the specified tags' do
      tag = create(:tag, account: account, user: user)
      tagged_txn = create_transaction
      untagged_txn = create_transaction
      create(:tag_plaid_transaction, tag: tag, plaid_transaction: tagged_txn, user: user)

      results = search(tag_ids: [tag.id])

      expect(results).to include(tagged_txn)
      expect(results).not_to include(untagged_txn)
    end

    it 'returns all transactions when tag_ids is empty' do
      txn1 = create_transaction
      txn2 = create_transaction

      results = search(tag_ids: [])

      expect(results).to include(txn1, txn2)
    end
  end

  describe 'omit_tag_ids filtering' do
    it 'excludes transactions with the specified tags' do
      tag = create(:tag, account: account, user: user)
      tagged_txn = create_transaction
      untagged_txn = create_transaction
      create(:tag_plaid_transaction, tag: tag, plaid_transaction: tagged_txn, user: user)

      results = search(omit_tag_ids: [tag.id])

      expect(results).not_to include(tagged_txn)
      expect(results).to include(untagged_txn)
    end

    it 'returns all transactions when omit_tag_ids is empty' do
      txn1 = create_transaction
      txn2 = create_transaction

      results = search(omit_tag_ids: [])

      expect(results).to include(txn1, txn2)
    end
  end

  describe 'tag_ids and omit_tag_ids combined' do
    it 'omit takes precedence over include' do
      include_tag = create(:tag, account: account, user: user, name: "Include")
      omit_tag = create(:tag, account: account, user: user, name: "Omit")

      both_tags_txn = create_transaction
      include_only_txn = create_transaction

      create(:tag_plaid_transaction, tag: include_tag, plaid_transaction: both_tags_txn, user: user)
      create(:tag_plaid_transaction, tag: omit_tag, plaid_transaction: both_tags_txn, user: user)
      create(:tag_plaid_transaction, tag: include_tag, plaid_transaction: include_only_txn, user: user)

      results = search(tag_ids: [include_tag.id], omit_tag_ids: [omit_tag.id])

      expect(results).to include(include_only_txn)
      expect(results).not_to include(both_tags_txn)
    end
  end
end
