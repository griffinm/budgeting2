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

  describe 'tag type' do
    it 'defaults to expense' do
      expect(make_tag.tag_type).to eq('expense')
    end

    it 'rejects invalid values' do
      expect(build(:merchant_tag, account: account, user: user, tag_type: 'transfer')).not_to be_valid
    end

    it 'forces children to inherit the parent type regardless of what was passed' do
      income_root = make_tag(tag_type: 'income')
      child = make_tag(parent_merchant_tag: income_root, tag_type: 'expense')

      expect(child.tag_type).to eq('income')
    end

    it 'cascades a root type change to all descendants' do
      root = make_tag
      child = make_tag(parent_merchant_tag: root)
      grandchild = make_tag(parent_merchant_tag: child)

      root.reload.update!(tag_type: 'income')

      expect(child.reload.tag_type).to eq('income')
      expect(grandchild.reload.tag_type).to eq('income')
    end

    it 're-types a subtree when it is reparented under a different-type root' do
      income_root = make_tag(tag_type: 'income')
      expense_root = make_tag
      child = make_tag(parent_merchant_tag: expense_root)
      grandchild = make_tag(parent_merchant_tag: child)

      child.reload.update!(parent_merchant_tag_id: income_root.id)

      expect(child.reload.tag_type).to eq('income')
      expect(grandchild.reload.tag_type).to eq('income')
    end

    it 'keeps its type when promoted to top level' do
      income_root = make_tag(tag_type: 'income')
      child = make_tag(parent_merchant_tag: income_root)

      child.reload.update!(parent_merchant_tag_id: nil)

      expect(child.reload.tag_type).to eq('income')
    end

    it 'preserves leaf budgets through a cascade' do
      root = make_tag
      child = make_tag(parent_merchant_tag: root, target_budget: 500)

      root.reload.update!(tag_type: 'income')

      expect(child.reload.target_budget).to eq(500)
      expect(child.tag_type).to eq('income')
    end

    it 'keeps promoted children type-consistent when a mid-tree tag is destroyed' do
      income_root = make_tag(tag_type: 'income')
      middle = make_tag(parent_merchant_tag: income_root)
      leaf = make_tag(parent_merchant_tag: middle)

      middle.reload.destroy!

      leaf.reload
      expect(leaf.parent_merchant_tag_id).to eq(income_root.id)
      expect(leaf.tag_type).to eq('income')
    end

    it 'keeps children income-typed when an income root is destroyed' do
      income_root = make_tag(tag_type: 'income')
      child = make_tag(parent_merchant_tag: income_root)

      income_root.reload.destroy!

      child.reload
      expect(child.parent_merchant_tag_id).to be_nil
      expect(child.tag_type).to eq('income')
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
