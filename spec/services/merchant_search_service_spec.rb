require 'rails_helper'

RSpec.describe MerchantSearchService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }

  before do
    create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
  end

  def create_merchant(attrs = {})
    create(:merchant, account: account, **attrs)
  end

  def create_transaction(merchant:, attrs: {})
    create(:plaid_transaction, account: account, plaid_account: plaid_account, merchant: merchant, **attrs)
  end

  def search(params = {})
    described_class.new(account_id: account.id, user_id: user.id, **params).call
  end

  describe 'transaction_count annotation' do
    it 'annotates each merchant with its transaction count' do
      merchant_a = create_merchant(merchant_name: "Alpha")
      merchant_b = create_merchant(merchant_name: "Beta")

      3.times { create_transaction(merchant: merchant_a) }
      1.times { create_transaction(merchant: merchant_b) }

      results = search
      alpha = results.find { |m| m.id == merchant_a.id }
      beta = results.find { |m| m.id == merchant_b.id }

      expect(alpha.transaction_count).to eq(3)
      expect(beta.transaction_count).to eq(1)
    end

    it 'returns 0 for merchants with no transactions' do
      merchant = create_merchant(merchant_name: "Empty")

      results = search
      found = results.find { |m| m.id == merchant.id }

      expect(found.transaction_count).to eq(0)
    end
  end

  describe 'sorting' do
    describe 'sort_by name' do
      it 'sorts by merchant_name ascending by default' do
        charlie = create_merchant(merchant_name: "Charlie")
        alpha = create_merchant(merchant_name: "Alpha")
        bravo = create_merchant(merchant_name: "Bravo")

        results = search
        expect(results.map(&:id)).to eq([alpha.id, bravo.id, charlie.id])
      end

      it 'sorts by merchant_name descending' do
        charlie = create_merchant(merchant_name: "Charlie")
        alpha = create_merchant(merchant_name: "Alpha")
        bravo = create_merchant(merchant_name: "Bravo")

        results = search(sort_by: 'name', sort_direction: 'desc')
        expect(results.map(&:id)).to eq([charlie.id, bravo.id, alpha.id])
      end
    end

    describe 'sort_by transaction_count' do
      it 'sorts by transaction count ascending' do
        few = create_merchant(merchant_name: "Few")
        many = create_merchant(merchant_name: "Many")
        none = create_merchant(merchant_name: "None")

        5.times { create_transaction(merchant: many) }
        2.times { create_transaction(merchant: few) }

        results = search(sort_by: 'transaction_count', sort_direction: 'asc')
        expect(results.map(&:id)).to eq([none.id, few.id, many.id])
      end

      it 'sorts by transaction count descending' do
        few = create_merchant(merchant_name: "Few")
        many = create_merchant(merchant_name: "Many")
        none = create_merchant(merchant_name: "None")

        5.times { create_transaction(merchant: many) }
        2.times { create_transaction(merchant: few) }

        results = search(sort_by: 'transaction_count', sort_direction: 'desc')
        expect(results.map(&:id)).to eq([many.id, few.id, none.id])
      end
    end

    describe 'invalid sort params' do
      it 'falls back to name asc for invalid sort_by' do
        bravo = create_merchant(merchant_name: "Bravo")
        alpha = create_merchant(merchant_name: "Alpha")

        results = search(sort_by: 'invalid')
        expect(results.map(&:id)).to eq([alpha.id, bravo.id])
      end

      it 'falls back to asc for invalid sort_direction' do
        bravo = create_merchant(merchant_name: "Bravo")
        alpha = create_merchant(merchant_name: "Alpha")

        results = search(sort_direction: 'invalid')
        expect(results.map(&:id)).to eq([alpha.id, bravo.id])
      end
    end
  end

  describe 'sorting with merchant_tag_id filter (DISTINCT)' do
    it 'sorts by transaction_count without SQL errors when DISTINCT is applied' do
      merchant_tag = MerchantTag.create!(account: account, user: user, name: "Food", color: "#ff0000", target_budget: 0)

      merchant_a = create_merchant(merchant_name: "A", default_merchant_tag: merchant_tag)
      merchant_b = create_merchant(merchant_name: "B", default_merchant_tag: merchant_tag)

      3.times { create_transaction(merchant: merchant_a) }
      1.times { create_transaction(merchant: merchant_b) }

      results = search(merchant_tag_id: merchant_tag.id, sort_by: 'transaction_count', sort_direction: 'desc')

      expect(results.map(&:id)).to eq([merchant_a.id, merchant_b.id])
    end

    it 'sorts by name without SQL errors when DISTINCT is applied' do
      merchant_tag = MerchantTag.create!(account: account, user: user, name: "Food", color: "#ff0000", target_budget: 0)

      bravo = create_merchant(merchant_name: "Bravo", default_merchant_tag: merchant_tag)
      alpha = create_merchant(merchant_name: "Alpha", default_merchant_tag: merchant_tag)

      results = search(merchant_tag_id: merchant_tag.id, sort_by: 'name', sort_direction: 'asc')

      expect(results.map(&:id)).to eq([alpha.id, bravo.id])
    end
  end

  describe 'search_term filtering' do
    it 'filters by merchant_name' do
      target = create_merchant(merchant_name: "Starbucks")
      _other = create_merchant(merchant_name: "Walmart")

      results = search(search_term: 'star')
      expect(results).to include(target)
      expect(results).not_to include(_other)
    end

    it 'filters by custom_name' do
      target = create_merchant(merchant_name: "SBux", custom_name: "Starbucks")
      _other = create_merchant(merchant_name: "Walmart")

      results = search(search_term: 'starbucks')
      expect(results).to include(target)
      expect(results).not_to include(_other)
    end

    it 'is case insensitive' do
      target = create_merchant(merchant_name: "STARBUCKS")

      results = search(search_term: 'starbucks')
      expect(results).to include(target)
    end
  end

  describe 'merchant_group_id filtering' do
    it 'filters by merchant group' do
      primary = create_merchant(merchant_name: "Primary")
      group = MerchantGroup.create!(account: account, name: "Coffee Shops", primary_merchant: primary)
      primary.update!(merchant_group_id: group.id)
      _ungrouped = create_merchant(merchant_name: "Ungrouped")

      results = search(merchant_group_id: group.id)
      expect(results).to include(primary)
      expect(results).not_to include(_ungrouped)
    end
  end

  describe 'merchant_tag_id filtering' do
    it 'includes merchants with matching default_merchant_tag' do
      tag = MerchantTag.create!(account: account, user: user, name: "Food", color: "#ff0000", target_budget: 0)
      tagged = create_merchant(merchant_name: "Tagged", default_merchant_tag: tag)
      _untagged = create_merchant(merchant_name: "Untagged")

      results = search(merchant_tag_id: tag.id)
      expect(results).to include(tagged)
      expect(results).not_to include(_untagged)
    end

    it 'includes merchants that have a transaction with the tag' do
      tag = MerchantTag.create!(account: account, user: user, name: "Food", color: "#ff0000", target_budget: 0)
      merchant = create_merchant(merchant_name: "Has Tagged Transaction")
      create_transaction(merchant: merchant, attrs: { merchant_tag_id: tag.id })
      _other = create_merchant(merchant_name: "No Tagged Transaction")

      results = search(merchant_tag_id: tag.id)
      expect(results).to include(merchant)
      expect(results).not_to include(_other)
    end

    it 'does not duplicate merchants matching both criteria' do
      tag = MerchantTag.create!(account: account, user: user, name: "Food", color: "#ff0000", target_budget: 0)
      merchant = create_merchant(merchant_name: "Both", default_merchant_tag: tag)
      create_transaction(merchant: merchant, attrs: { merchant_tag_id: tag.id })

      results = search(merchant_tag_id: tag.id)
      expect(results.select { |m| m.id == merchant.id }.length).to eq(1)
    end
  end

  describe 'account scoping' do
    it 'does not return merchants from other accounts' do
      other_account = create(:account)
      _other_merchant = create(:merchant, account: other_account, merchant_name: "Other")
      our_merchant = create_merchant(merchant_name: "Ours")

      results = search
      expect(results).to include(our_merchant)
      expect(results).not_to include(_other_merchant)
    end
  end
end
