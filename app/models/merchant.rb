class Merchant < ApplicationRecord
  belongs_to :account
  belongs_to :merchant_group, optional: true
  has_many :merchants_merchant_tags, dependent: :destroy
  has_many :merchant_tags, through: :merchants_merchant_tags
  has_many :plaid_transactions
  belongs_to :default_merchant_tag, class_name: 'MerchantTag', optional: true
  
  # Merchant group relationships
  has_many :merchant_group_memberships, dependent: :destroy
  has_many :merchant_groups, through: :merchant_group_memberships
  has_many :primary_merchant_groups, class_name: 'MerchantGroup', foreign_key: 'primary_merchant_id'

  after_save :apply_defaults

  scope :in_group, -> (group_id) { where(merchant_group_id: group_id) }

  def full_address
    [address, city, state, zip].compact.join(', ')
  end

  def merchants_in_group
    group_id = merchant_group_id
    return [self] if group_id.blank?

    return Merchant.where(merchant_group_id: group_id)
  end

  def apply_defaults
    if saved_change_to_default_transaction_type?
      apply_default_transaction_type_to_all_transactions
    end
    if saved_change_to_default_merchant_tag_id?
      apply_default_merchant_tag_to_all_transactions
    end
  end

  def apply_default_transaction_type_to_all_transactions
    transactions = PlaidTransaction.where(merchant_id: id, account_id: account_id)
    transactions.each do |transaction|
      transaction.update(transaction_type: default_transaction_type)
    end
  end

  def apply_default_merchant_tag_to_all_transactions
    transactions = PlaidTransaction.where(merchant_id: id, account_id: account_id)

    transactions.each do |transaction|
      transaction.update(merchant_tag_id: default_merchant_tag_id)
    end
  end

  def grouped_merchants
    return [self] unless merchant_group
    
    merchant_group.merchants
  end

  def is_primary_in_group?
    return false unless merchant_group
    
    merchant_group.primary_merchant_id == id
  end

  def group_transactions
    return plaid_transactions unless merchant_group
    
    merchant_group.all_transactions
  end

  def group_spend(months_back = nil)
    return total_spend(months_back) unless merchant_group
    
    merchant_group.total_spend(months_back)
  end

  def total_spend(months_back = nil)
    query = plaid_transactions
    query = query.where(date: months_back.months.ago..Time.current) if months_back
    query.sum(:amount).abs
  end
end 
