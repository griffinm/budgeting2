class Merchant < ApplicationRecord
  audited

  belongs_to :account
  belongs_to :merchant_group, optional: true
  has_many :plaid_transactions
  belongs_to :default_merchant_tag, class_name: 'MerchantTag', optional: true
  belongs_to :merchant_tag, optional: true
  
  has_many :merchant_default_tags, dependent: :destroy
  has_many :default_tags, through: :merchant_default_tags, source: :tag

  # Merchant group relationships
  has_many :merchant_group_memberships, dependent: :destroy
  has_many :merchant_groups, through: :merchant_group_memberships
  has_many :primary_merchant_groups, class_name: 'MerchantGroup', foreign_key: 'primary_merchant_id'

  scope :in_group, -> (group_id) { where(merchant_group_id: group_id) }

  def full_address
    [address, city, state, zip].compact.join(', ')
  end

  def merchants_in_group
    group_id = merchant_group_id
    return [self] if group_id.blank?

    return Merchant.where(merchant_group_id: group_id)
  end

  def grouped_merchant_ids
    merchant_group ? merchant_group.merchant_ids : [id]
  end

  def apply_default_transaction_type_to_all_transactions
    PlaidTransaction.where(merchant_id: grouped_merchant_ids, account_id: account_id).each do |transaction|
      transaction.update(transaction_type: default_transaction_type)
    end
  end

  def apply_default_merchant_tag_to_all_transactions
    PlaidTransaction.where(merchant_id: grouped_merchant_ids, account_id: account_id).each do |transaction|
      transaction.update(merchant_tag_id: default_merchant_tag_id)
    end
  end

  def apply_default_tags_to_all_transactions
    transactions = PlaidTransaction.where(merchant_id: grouped_merchant_ids, account_id: account_id)

    merchant_default_tags.each do |mdt|
      transactions.each do |transaction|
        TagPlaidTransaction.find_or_create_by(
          tag_id: mdt.tag_id,
          plaid_transaction_id: transaction.id,
          user_id: mdt.user_id
        )
      end
    end
  end

  def propagate_defaults_to_group
    return unless merchant_group

    merchant_group.merchants.where.not(id: id).each do |group_merchant|
      group_merchant.update(
        default_merchant_tag_id: default_merchant_tag_id,
        default_transaction_type: default_transaction_type
      )

      # Sync default tags
      current_tag_ids = merchant_default_tags.pluck(:tag_id)
      group_merchant.merchant_default_tags.where.not(tag_id: current_tag_ids).destroy_all
      current_tag_ids.each do |tag_id|
        mdt = merchant_default_tags.find_by(tag_id: tag_id)
        group_merchant.merchant_default_tags.find_or_create_by(tag_id: tag_id) do |new_mdt|
          new_mdt.user_id = mdt.user_id
        end
      end
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
