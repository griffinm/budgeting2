class PlaidTransaction < ApplicationRecord
  include Typesense
  
  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant

  def self.full_text_search(query: nil, account_id: nil)
    merchant_results = []
    transaction_name_results = []

    if query.present?
      merchant_results = PlaidTransaction.search(query, 'merchant_name', {
        per_page: 10,
        query_by: 'merchant_name',
        filter_by: "account_id: #{account_id}",
      })
      transaction_name_results = PlaidTransaction.search(query, 'name', {
        per_page: 10,
        query_by: 'name',
        query_fields: ['name'],
        filter_by: "account_id: #{account_id}",
      })
    end

    # Add the merchant and p;laid accounts to the results
    merchant_results.each do |result|
      result['merchant'] = PlaidMerchant.find(result['merchant_id'])
      result['plaid_account'] = PlaidAccount.find(result['plaid_account_id'])
    end
    transaction_name_results.each do |result|
      result['plaid_account'] = PlaidAccount.find(result['plaid_account_id'])
      result['merchant'] = PlaidMerchant.find(result['merchant_id'])
    end

    {
      merchant_results: merchant_results,
      transaction_name_results: transaction_name_results,
    }
  end

  typesense do
    attribute :id, :date, :account_name, :account_id, :name

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
