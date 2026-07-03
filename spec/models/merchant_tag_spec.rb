require 'rails_helper'

RSpec.describe MerchantTag, type: :model do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }

  def make_tag(**attrs)
    create(:merchant_tag, account: account, user: user, **attrs)
  end

  describe 'factory' do
    it 'creates a valid leaf tag with a color' do
      tag = make_tag
      expect(tag).to be_persisted
      expect(tag.is_leaf).to be(true)
      expect(tag.color).to be_present
    end
  end

  describe 'leafness sync' do
    it 'marks the parent as non-leaf and clears its budget when a child is created' do
      parent = make_tag(target_budget: 500)
      expect(parent.is_leaf).to be(true)
      expect(parent.target_budget).to eq(500)

      make_tag(parent_merchant_tag: parent)

      parent.reload
      expect(parent.is_leaf).to be(false)
      expect(parent.target_budget).to be_nil
    end

    it 'marks the old parent as leaf again when its only child is reparented away' do
      old_parent = make_tag
      new_parent = make_tag
      child = make_tag(parent_merchant_tag: old_parent)

      child.update!(parent_merchant_tag_id: new_parent.id)

      expect(old_parent.reload.is_leaf).to be(true)
      expect(new_parent.reload.is_leaf).to be(false)
    end

    it 'keeps the parent non-leaf when it still has other children' do
      parent = make_tag
      make_tag(parent_merchant_tag: parent)
      child2 = make_tag(parent_merchant_tag: parent)

      child2.update!(parent_merchant_tag_id: nil)

      expect(parent.reload.is_leaf).to be(false)
    end
  end

  describe 'target budget' do
    it 'allows a nil target budget' do
      expect(build(:merchant_tag, account: account, user: user, target_budget: nil)).to be_valid
    end

    it 'rejects a negative target budget' do
      expect(build(:merchant_tag, account: account, user: user, target_budget: -1)).not_to be_valid
    end

    it 'clears the target budget on non-leaf tags' do
      parent = make_tag
      make_tag(parent_merchant_tag: parent)

      parent.reload.update!(target_budget: 250)
      expect(parent.reload.target_budget).to be_nil
    end
  end

  describe '#destroy' do
    it 'promotes children to the deleted tag\'s parent' do
      grandparent = make_tag
      parent = make_tag(parent_merchant_tag: grandparent)
      child = make_tag(parent_merchant_tag: parent)

      parent.destroy!

      expect(child.reload.parent_merchant_tag_id).to eq(grandparent.id)
      expect(grandparent.reload.is_leaf).to be(false)
    end

    it 'promotes children of a top-level tag to top-level' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)

      parent.destroy!

      expect(child.reload.parent_merchant_tag_id).to be_nil
    end

    it 'marks the parent as leaf when the destroyed tag was its only child' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)

      child.destroy!

      expect(parent.reload.is_leaf).to be(true)
    end

    it 'uncategorizes its transactions' do
      tag = make_tag
      transaction = create(:plaid_transaction, account: account, merchant_tag: tag)

      tag.destroy!

      expect(transaction.reload.merchant_tag_id).to be_nil
    end

    it 'clears merchants defaulting to it' do
      tag = make_tag
      merchant = create(:merchant, account: account, default_merchant_tag_id: tag.id)

      tag.destroy!

      expect(merchant.reload.default_merchant_tag_id).to be_nil
    end
  end
end
