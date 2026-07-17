require 'rails_helper'

RSpec.describe PlaidAccount do
  let(:account) { create(:account) }

  describe '#archived?' do
    it 'is false when archived_at is nil' do
      expect(build(:plaid_account).archived?).to be false
    end

    it 'is true when archived_at is set' do
      expect(build(:plaid_account, :archived).archived?).to be true
    end
  end

  describe '#archived=' do
    let(:plaid_account) { create(:plaid_account, account: account) }

    it 'sets archived_at when given true' do
      plaid_account.update!(archived: true)
      expect(plaid_account.archived_at).to be_present
    end

    it 'casts the string "true"' do
      plaid_account.update!(archived: 'true')
      expect(plaid_account.archived_at).to be_present
    end

    it 'clears archived_at when given false' do
      plaid_account.update!(archived_at: 1.day.ago)
      plaid_account.update!(archived: false)
      expect(plaid_account.archived_at).to be_nil
    end

    it 'treats nil as unarchived' do
      plaid_account.update!(archived_at: 1.day.ago)
      plaid_account.update!(archived: nil)
      expect(plaid_account.archived_at).to be_nil
    end

    it 'preserves the original timestamp when archiving twice' do
      original = 3.days.ago
      plaid_account.update!(archived_at: original)
      plaid_account.update!(archived: true)
      expect(plaid_account.archived_at).to be_within(1.second).of(original)
    end
  end

  describe 'archive scopes' do
    let!(:active_account) { create(:plaid_account, account: account) }
    let!(:archived_account) { create(:plaid_account, :archived, account: account) }

    it '.not_archived returns only unarchived accounts' do
      expect(PlaidAccount.not_archived).to contain_exactly(active_account)
    end

    it '.archived returns only archived accounts' do
      expect(PlaidAccount.archived).to contain_exactly(archived_account)
    end

    it 'excludes soft-deleted accounts from both scopes' do
      # Set deleted_at directly: destroy would also hard-delete the access token
      # (belongs_to dependent: :destroy) and trip the FK from this soft-deleted row.
      archived_account.update!(deleted_at: Time.current)
      expect(PlaidAccount.archived).to be_empty
      expect(PlaidAccount.not_archived).to contain_exactly(active_account)
    end
  end
end
