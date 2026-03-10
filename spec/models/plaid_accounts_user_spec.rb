require 'rails_helper'

RSpec.describe PlaidAccountsUser, type: :model do
  let(:account) { create(:account) }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }
  let(:user) { create(:user, account: account) }

  describe 'validations' do
    it 'is valid with valid attributes' do
      pau = build(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      expect(pau).to be_valid
    end

    it 'does not allow duplicate user and plaid_account pairs' do
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      duplicate = build(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      expect(duplicate).not_to be_valid
    end
  end

  describe 'user plaid_accounts association' do
    it 'does not return duplicate plaid accounts when multiple users are linked' do
      user2 = create(:user, account: account)
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      create(:plaid_accounts_user, user: user2, plaid_account: plaid_account)

      expect(user.plaid_accounts).to eq([plaid_account])
      expect(user.plaid_accounts.count).to eq(1)
    end

    it 'excludes soft-deleted plaid accounts' do
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      plaid_account.update_column(:deleted_at, Time.current)

      expect(user.plaid_accounts).to be_empty
    end

    it 'returns only non-deleted plaid accounts when mix of active and soft-deleted exist' do
      plaid_account2 = create(:plaid_account, account: account, plaid_access_token: plaid_access_token)
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account2)

      plaid_account.update_column(:deleted_at, Time.current)

      expect(user.plaid_accounts).to eq([plaid_account2])
    end
  end
end
