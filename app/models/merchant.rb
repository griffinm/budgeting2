class Merchant < ApplicationRecord
  belongs_to :account
  has_many :merchants_merchant_tags, dependent: :destroy
  has_many :merchant_tags, through: :merchants_merchant_tags
  has_many :plaid_transactions
  belongs_to :default_merchant_tag, class_name: 'MerchantTag', optional: true

  after_save :apply_defaults

  def full_address
    [address, city, state, zip].compact.join(', ')
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
end 
