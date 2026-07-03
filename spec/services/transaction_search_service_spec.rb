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

  describe 'needs_review filtering' do
    it 'returns only unconfirmed classifications' do
      legacy = create_transaction(classification_source: nil)
      guessed = create_transaction(classification_source: 'sign_inference')
      user_set = create_transaction(classification_source: 'user')
      merchant_set = create_transaction(classification_source: 'merchant_default')
      plaid_set = create_transaction(classification_source: 'plaid_category')

      results = search(needs_review: 'true')

      expect(results).to include(legacy, guessed)
      expect(results).not_to include(user_set, merchant_set, plaid_set)
    end

    it 'returns everything when off or absent' do
      legacy = create_transaction(classification_source: nil)
      user_set = create_transaction(classification_source: 'user')

      expect(search).to include(legacy, user_set)
      expect(search(needs_review: 'false')).to include(legacy, user_set)
    end
  end

  describe 'amount filtering' do
    it 'compares magnitudes so income matches alongside expenses' do
      big_income = create_transaction(amount: -500.00, transaction_type: 'income')
      big_expense = create_transaction(amount: 200.00)
      small_expense = create_transaction(amount: 50.00)

      results = search(amount_greater_than: 100)

      expect(results).to include(big_income, big_expense)
      expect(results).not_to include(small_expense)
    end

    it 'matches amount_equal_to by magnitude' do
      income = create_transaction(amount: -75.00, transaction_type: 'income')
      other = create_transaction(amount: 20.00)

      results = search(amount_equal_to: 75)

      expect(results).to include(income)
      expect(results).not_to include(other)
    end

    it 'matches amount_less_than by magnitude' do
      income = create_transaction(amount: -500.00, transaction_type: 'income')
      small_expense = create_transaction(amount: 50.00)

      results = search(amount_less_than: 100)

      expect(results).to include(small_expense)
      expect(results).not_to include(income)
    end

    it 'matches a numeric search term by magnitude' do
      income = create_transaction(amount: -1522.45, transaction_type: 'income')

      results = search(search_term: '1522.45')

      expect(results).to include(income)
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

  describe 'split transactions' do
    it 'excludes split parents but returns their children' do
      parent = create_transaction(amount: 50.00)
      child = create(:plaid_transaction, :split_child, parent: parent, amount: 50.00, name: 'Cash groceries')
      parent.update!(split: true)

      results = search

      expect(results).to include(child)
      expect(results).not_to include(parent)
    end

    it 'children match search filters like normal transactions' do
      parent = create_transaction(amount: 50.00)
      child = create(:plaid_transaction, :split_child, parent: parent, amount: 50.00, name: 'Cash groceries')
      parent.update!(split: true)

      results = search(search_term: 'groceries')

      expect(results).to contain_exactly(child)
    end
  end
end
