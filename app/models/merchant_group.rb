class MerchantGroup < ApplicationRecord
  belongs_to :account
  belongs_to :primary_merchant, class_name: 'Merchant'
  has_many :merchant_group_memberships, dependent: :destroy
  has_many :merchants, through: :merchant_group_memberships

  validates :name, presence: true
  validates :name, uniqueness: { scope: :account_id }

  def add_merchant(merchant)
    return false unless merchant.account_id == account_id
    
    merchant_group_memberships.create(merchant: merchant)
    merchant.update(merchant_group: self)
  end

  def remove_merchant(merchant)
    membership = merchant_group_memberships.find_by(merchant: merchant)
    return false unless membership
    
    merchant.update(merchant_group: nil)
    membership.destroy
  end

  def set_primary_merchant(merchant)
    return false unless merchants.include?(merchant)
    
    # Update all memberships to not be primary
    merchant_group_memberships.update_all(is_primary: false)
    
    # Set the new primary merchant
    membership = merchant_group_memberships.find_by(merchant: merchant)
    membership.update(is_primary: true)
    
    # Update the group's primary merchant reference
    update(primary_merchant: merchant)
  end

  def primary_merchant_membership
    merchant_group_memberships.find_by(is_primary: true)
  end

  def all_transactions
    PlaidTransaction.joins(:merchant)
                   .where(merchants: { id: merchant_ids })
                   .order(date: :desc)
  end

  def total_spend(months_back = nil)
    query = all_transactions
    query = query.where(date: months_back.months.ago..Time.current) if months_back
    query.sum(:amount).abs
  end
end
