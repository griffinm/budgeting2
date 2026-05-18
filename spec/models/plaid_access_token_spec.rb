require 'rails_helper'

RSpec.describe PlaidAccessToken do
  let(:account) { create(:account) }
  let(:token) { create(:plaid_access_token, account: account) }

  describe 'defaults' do
    it 'is active when created' do
      expect(token.status).to eq('active')
      expect(token).to be_healthy
      expect(token).not_to be_needs_reconnect
    end
  end

  describe '#mark_error!' do
    context 'with a reauth-class error code' do
      it 'flags the Item for reconnection' do
        token.mark_error!('ITEM_LOGIN_REQUIRED')

        expect(token.reload.status).to eq('login_required')
        expect(token.error_code).to eq('ITEM_LOGIN_REQUIRED')
        expect(token.last_error_at).to be_present
        expect(token).to be_needs_reconnect
      end

      it 'treats PENDING_EXPIRATION as needing reconnection' do
        token.mark_error!('PENDING_EXPIRATION')
        expect(token.reload.status).to eq('login_required')
      end
    end

    context 'with a transient error code' do
      it 'records a generic error without flagging reconnection' do
        token.mark_error!('INTERNAL_SERVER_ERROR')

        expect(token.reload.status).to eq('error')
        expect(token.error_code).to eq('INTERNAL_SERVER_ERROR')
        expect(token).not_to be_needs_reconnect
      end
    end
  end

  describe '#mark_healthy!' do
    it 'clears the error state and records the sync time' do
      token.mark_error!('ITEM_LOGIN_REQUIRED')
      token.mark_healthy!

      expect(token.reload.status).to eq('active')
      expect(token.error_code).to be_nil
      expect(token.last_synced_at).to be_present
      expect(token).to be_healthy
    end
  end

  describe 'scopes' do
    it 'separates healthy tokens from those needing attention' do
      healthy = create(:plaid_access_token, account: account)
      broken = create(:plaid_access_token, account: account)
      broken.mark_error!('ITEM_LOGIN_REQUIRED')

      expect(PlaidAccessToken.healthy).to include(healthy)
      expect(PlaidAccessToken.healthy).not_to include(broken)
      expect(PlaidAccessToken.needs_attention).to include(broken)
      expect(PlaidAccessToken.needs_attention).not_to include(healthy)
    end
  end
end
