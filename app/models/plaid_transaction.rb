class PlaidTransaction < ApplicationRecord
  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant
  
  def to_builder
    Jbuilder.new do |json|
      json.id id
      json.name name
      json.amount amount
      json.date authorized_at
    end
  end

  def self.all_for_account(account_id)
    PlaidTransaction.joins(:account)
      .where(account: { id: account_id })
      .order(authorized_at: :desc)
  end
end 
