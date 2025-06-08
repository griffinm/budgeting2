class PlaidTransaction < ApplicationRecord
  include Typesense
  
  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant

  typesense do
    attribute :id, :date, :account_name

    attribute :transaction_date do
      date.strftime("%Y-%m-%d")
    end

    attribute :transaction_amount do
      amount.to_s
    end

    attribute :merchant_name do
      merchant.merchant_name
    end

    attribute :account_name do
      plaid_account.pick_name
    end
  end
end 
