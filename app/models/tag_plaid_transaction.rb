class TagPlaidTransaction < ApplicationRecord
  belongs_to :tag
  belongs_to :plaid_transaction
  belongs_to :user
end