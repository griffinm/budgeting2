class PlaidTransaction < ApplicationRecord
  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
end 
