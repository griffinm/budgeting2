require 'rails_helper'

RSpec.describe PlaidService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }
  let(:plaid_account_user) { create(:plaid_accounts_user, user: user, plaid_account: plaid_account) }
  let(:service) { described_class.new(account_id: account.id) }

  before do
    # Stub environment variables
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("PLAID_CLIENT_ID").and_return("test_client_id")
    allow(ENV).to receive(:[]).with("PLAID_SECRET_PRODUCTION").and_return("test_secret")
  end

  describe '#initialize' do
    context 'with valid account_id' do
      it 'initializes successfully' do
        expect { described_class.new(account_id: account.id) }.not_to raise_error
      end

      it 'sets the account instance variable' do
        service = described_class.new(account_id: account.id)
        expect(service.instance_variable_get(:@account)).to eq(account)
      end
    end

    context 'with invalid account_id' do
      it 'raises an error' do
        expect { described_class.new(account_id: 999999) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#sync_transactions' do
    let(:mock_api_client) { instance_double(Plaid::PlaidApi) }
    let(:mock_sync_response) { instance_double(Plaid::TransactionsSyncResponse) }
    let(:mock_sync_request) { instance_double(Plaid::TransactionsSyncRequest) }
    let(:mock_transaction) { instance_double(Plaid::Transaction) }
    let(:mock_personal_finance_category) { instance_double(Plaid::PersonalFinanceCategory) }

    before do
      allow(Plaid::TransactionsSyncRequest).to receive(:new).and_return(mock_sync_request)
      allow(mock_sync_request).to receive(:cursor=)
      allow(service).to receive(:api_client).and_return(mock_api_client)
      allow(mock_api_client).to receive(:transactions_sync).and_return(mock_sync_response)
      allow(mock_sync_response).to receive(:added).and_return([])
      allow(mock_sync_response).to receive(:modified).and_return([])
      allow(mock_sync_response).to receive(:removed).and_return([])
      allow(mock_sync_response).to receive(:next_cursor).and_return("next_cursor_123")
      allow(mock_sync_response).to receive(:has_more).and_return(false)
    end

    context 'when account has access tokens' do
      before do
        plaid_access_token # Create the access token
      end

      it 'creates a sync event' do
        expect { service.sync_transactions }.to change(PlaidSyncEvent, :count).by(1)
      end

      it 'creates sync event with correct attributes' do
        expect { service.sync_transactions }.to change(PlaidSyncEvent, :count).by(1)
        
        sync_event = PlaidSyncEvent.last
        expect(sync_event.account_id).to eq(account.id)
        expect(sync_event.plaid_access_token_id).to eq(plaid_access_token.id)
        expect(sync_event.started_at).to be_present
        # The cursor gets updated during sync, so we check it's not nil
        expect(sync_event.cursor).to be_present
      end

      it 'calls Plaid API with correct parameters' do
        expect(Plaid::TransactionsSyncRequest).to receive(:new).with(
          access_token: plaid_access_token.token,
          cursor: plaid_access_token.next_cursor
        )
        
        service.sync_transactions
      end

      it 'updates access token cursor' do
        service.sync_transactions
        plaid_access_token.reload
        expect(plaid_access_token.next_cursor).to eq("next_cursor_123")
      end

      it 'marks sync event as completed' do
        service.sync_transactions
        sync_event = PlaidSyncEvent.last
        
        expect(sync_event.event_type).to eq("COMPLETED")
        expect(sync_event.completed_at).to be_present
      end

      context 'when there are added transactions' do
        let(:mock_transaction) do
          double(
            account_id: plaid_account.plaid_id,
            transaction_id: "txn_123",
            amount: -50.00,
            name: "Test Transaction",
            authorized_date: Date.current,
            date: Date.current,
            check_number: nil,
            iso_currency_code: "USD",
            pending: false,
            personal_finance_category: mock_personal_finance_category,
            payment_channel: "online",
            merchant_entity_id: "entity_123"
          )
        end

        before do
          allow(mock_personal_finance_category).to receive(:primary).and_return("FOOD_AND_DRINK")
          allow(mock_personal_finance_category).to receive(:detailed).and_return("RESTAURANTS")
          allow(mock_sync_response).to receive(:added).and_return([mock_transaction])
        end

        it 'creates new transactions' do
          expect { service.sync_transactions }.to change(PlaidTransaction, :count).by(1)
        end

        it 'creates transaction with correct attributes' do
          service.sync_transactions
          transaction = PlaidTransaction.last
          
          expect(transaction.account_id).to eq(account.id)
          expect(transaction.plaid_id).to eq("txn_123")
          expect(transaction.amount).to eq(-50.00)
          expect(transaction.name).to eq("Test Transaction")
          expect(transaction.currency_code).to eq("USD")
          expect(transaction.pending).to eq(false)
          expect(transaction.plaid_category_primary).to eq("FOOD_AND_DRINK")
          expect(transaction.plaid_category_detail).to eq("RESTAURANTS")
          expect(transaction.payment_channel).to eq("online")
          expect(transaction.transaction_type).to eq("expense")
        end

        it 'creates merchant if it does not exist' do
          expect { service.sync_transactions }.to change(Merchant, :count).by(1)
          
          merchant = Merchant.last
          expect(merchant.merchant_name).to eq("Test Transaction")
          expect(merchant.plaid_entity_id).to eq("entity_123")
          expect(merchant.account_id).to eq(account.id)
        end

        context 'when merchant already exists by plaid_entity_id' do
          let!(:existing_merchant) { create(:merchant, :with_plaid_entity_id, account: account, plaid_entity_id: "entity_123") }

          it 'uses existing merchant' do
            expect { service.sync_transactions }.not_to change(Merchant, :count)
          end
        end

        context 'when merchant already exists by name' do
          let!(:existing_merchant) { create(:merchant, account: account, merchant_name: "Test Transaction") }

          it 'uses existing merchant' do
            expect { service.sync_transactions }.not_to change(Merchant, :count)
          end
        end
      end

      context 'when there are modified transactions' do
        let!(:existing_transaction) { create(:plaid_transaction, account: account, plaid_id: "txn_123", plaid_account: plaid_account) }
        let(:mock_modified_transaction) do
          double(
            transaction_id: "txn_123",
            account_id: plaid_account.plaid_id,
            amount: -75.00,
            name: "Updated Transaction",
            authorized_date: Date.current
          )
        end

        before do
          allow(mock_sync_response).to receive(:modified).and_return([mock_modified_transaction])
        end

        it 'updates existing transaction' do
          service.sync_transactions
          existing_transaction.reload
          expect(existing_transaction.amount).to eq(-75.00)
          expect(existing_transaction.name).to eq("Updated Transaction")
        end
      end

      context 'when there are removed transactions' do
        let!(:existing_transaction) { create(:plaid_transaction, account: account, plaid_id: "txn_123") }
        let(:mock_transaction) { double(transaction_id: "txn_123") }

        before do
          allow(mock_sync_response).to receive(:removed).and_return([mock_transaction])
        end

        it 'removes the transaction' do
          expect { service.sync_transactions }.to change(PlaidTransaction, :count).by(-1)
        end
      end

      context 'when there are more pages to sync' do
        before do
          allow(mock_sync_response).to receive(:has_more).and_return(true, false)
        end

        it 'continues syncing until no more pages' do
          expect(mock_api_client).to receive(:transactions_sync).twice
          service.sync_transactions
        end

        it 'updates cursor for each page' do
          service.sync_transactions
          plaid_access_token.reload
          expect(plaid_access_token.next_cursor).to eq("next_cursor_123")
        end
      end
    end

    context 'when account has no access tokens' do
      let(:service) { described_class.new(account_id: account.id, plaid_access_tokens: []) }
      before do
        PlaidAccessToken.where(account_id: account.id).destroy_all
      end

      it 'does not create any sync events' do
        expect { service.sync_transactions }.not_to change(PlaidSyncEvent, :count)
      end

      it 'does not call Plaid API' do
        expect(mock_api_client).not_to receive(:transactions_sync)
        service.sync_transactions
      end
    end
  end

  describe '#update_account_balances' do
    let(:mock_api_client) { instance_double(Plaid::PlaidApi) }
    let(:mock_balance_response) { double('balance_response') }
    let(:mock_balance_request) { double('balance_request') }
    let(:mock_plaid_account) { double('plaid_account') }
    let(:mock_balances) { double('balances') }

    before do
      allow(Plaid::AccountsBalanceGetRequest).to receive(:new).and_return(mock_balance_request)
      allow(service).to receive(:api_client).and_return(mock_api_client)
      allow(mock_api_client).to receive(:accounts_balance_get).and_return(mock_balance_response)
      allow(mock_balance_response).to receive(:accounts).and_return([mock_plaid_account])
      allow(mock_plaid_account).to receive(:account_id).and_return(plaid_account.plaid_id)
      allow(mock_plaid_account).to receive(:balances).and_return(mock_balances)
      allow(mock_balances).to receive(:current).and_return(1000.00)
      allow(mock_balances).to receive(:available).and_return(950.00)
      allow(mock_balances).to receive(:limit).and_return(nil)
    end

    context 'when account has access tokens' do
      before do
        plaid_access_token # Create the access token
        plaid_account # Create the plaid account
      end

      it 'creates account balances' do
        expect { service.update_account_balances }.to change(AccountBalance, :count).by(1)
      end

      it 'creates balance with correct attributes' do
        service.update_account_balances
        balance = AccountBalance.last
        
        expect(balance.plaid_account_id).to eq(plaid_account.id)
        expect(balance.current_balance).to eq(1000.00)
        expect(balance.available_balance).to eq(950.00)
        expect(balance.limit).to be_nil
      end

      it 'calls Plaid API with correct parameters' do
        expect(Plaid::AccountsBalanceGetRequest).to receive(:new).with(
          access_token: plaid_access_token.token
        )
        
        service.update_account_balances
      end

      context 'when account has multiple access tokens' do
        let(:plaid_access_token2) { create(:plaid_access_token, account: account) }
        let(:plaid_account2) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token2) }
        let(:plaid_account_user2) { create(:plaid_accounts_user, user: user, plaid_account: plaid_account2) }

        before do
          plaid_account_user2 # Create second account user association
        end

        it 'creates balances for all accounts' do
          expect { service.update_account_balances }.to change(AccountBalance, :count).by(2)
        end

        it 'calls Plaid API for each access token' do
          expect(mock_api_client).to receive(:accounts_balance_get).twice
          service.update_account_balances
        end
      end

      context 'when account has credit card with limit' do
        before do
          allow(mock_balances).to receive(:limit).and_return(5000.00)
        end

        it 'creates balance with limit' do
          service.update_account_balances
          balance = AccountBalance.last
          expect(balance.limit).to eq(5000.00)
        end
      end

      context 'when plaid account is not found' do
        before do
          allow(mock_plaid_account).to receive(:account_id).and_return("non_existent_id")
        end

        it 'does not create balance and does not raise error' do
          expect { service.update_account_balances }.not_to raise_error
          expect(AccountBalance.count).to eq(0)
        end
      end
    end

    context 'when account has no access tokens' do
      let(:service) { described_class.new(account_id: account.id, plaid_access_tokens: []) }
      before do
        PlaidAccessToken.where(account_id: account.id).destroy_all
      end

      it 'does not create any balances' do
        expect { service.update_account_balances }.not_to change(AccountBalance, :count)
      end

      it 'does not call Plaid API' do
        expect(mock_api_client).not_to receive(:accounts_balance_get)
        service.update_account_balances
      end
    end
  end

  describe '#api_client' do
    it 'returns a Plaid API client' do
      client = service.send(:api_client)
      expect(client).to be_a(Plaid::PlaidApi)
    end

    it 'configures the client with production environment' do
      expect(Plaid::Configuration).to receive(:new).and_call_original
      
      client = service.send(:api_client)
      expect(client).to be_a(Plaid::PlaidApi)
    end
  end

  describe 'private methods' do
    let(:plaid_sync_event) { create(:plaid_sync_event, account: account, plaid_access_token: plaid_access_token) }
    let(:mock_transaction) do
      double(
        account_id: plaid_account.plaid_id,
        transaction_id: "txn_123",
        amount: -50.00,
        name: "Test Transaction",
        authorized_date: Date.current,
        date: Date.current,
        check_number: nil,
        iso_currency_code: "USD",
        pending: false,
        personal_finance_category: double(primary: "FOOD_AND_DRINK", detailed: "RESTAURANTS"),
        payment_channel: "online",
        merchant_entity_id: "entity_123"
      )
    end

    before do
      plaid_account # Create the plaid account
    end

    describe '#add_transactions' do
      it 'creates new transactions' do
        expect { service.send(:add_transactions, [mock_transaction], plaid_sync_event) }.to change(PlaidTransaction, :count).by(1)
      end

      it 'logs the operation' do
        expect(Rails.logger).to receive(:info).with("Adding 1 transactions for account #{account.id} sync event #{plaid_sync_event.id}")
        service.send(:add_transactions, [mock_transaction], plaid_sync_event)
      end
    end

    describe '#update_transactions' do
      let!(:existing_transaction) { create(:plaid_transaction, account: account, plaid_id: "txn_123") }

      it 'updates existing transaction' do
        service.send(:update_transactions, [mock_transaction], plaid_sync_event)
        existing_transaction.reload
        
        expect(existing_transaction.amount).to eq(-50.00)
        expect(existing_transaction.name).to eq("Test Transaction")
      end

      it 'logs the operation' do
        expect(Rails.logger).to receive(:info).with("Updating 1 transactions for account #{account.id} sync event #{plaid_sync_event.id}")
        service.send(:update_transactions, [mock_transaction], plaid_sync_event)
      end
    end

    describe '#remove_transactions' do
      let!(:existing_transaction) { create(:plaid_transaction, account: account, plaid_id: "txn_123") }
      let(:mock_removed_transaction) { double(transaction_id: "txn_123") }

      it 'removes the transaction' do
        expect { service.send(:remove_transactions, [mock_removed_transaction], plaid_sync_event) }.to change(PlaidTransaction, :count).by(-1)
      end

      it 'logs the operation' do
        expect(Rails.logger).to receive(:info).with("Removing 1 transactions for account #{account.id} sync event #{plaid_sync_event.id}")
        service.send(:remove_transactions, [mock_removed_transaction], plaid_sync_event)
      end

      context 'when transaction does not exist' do
        let(:mock_removed_transaction) { double(transaction_id: "non_existent") }

        it 'does not raise an error' do
          expect { service.send(:remove_transactions, [mock_removed_transaction], plaid_sync_event) }.not_to raise_error
        end
      end
    end

    describe '#merchant_for_transaction' do
      context 'when merchant exists by plaid_entity_id' do
        let!(:existing_merchant) { create(:merchant, :with_plaid_entity_id, account: account, plaid_entity_id: "entity_123") }

        it 'returns existing merchant' do
          merchant = service.send(:merchant_for_transaction, mock_transaction, "entity_123")
          expect(merchant).to eq(existing_merchant)
        end
      end

      context 'when merchant exists by name' do
        let!(:existing_merchant) { create(:merchant, account: account, merchant_name: "Test Transaction") }

        it 'returns existing merchant' do
          merchant = service.send(:merchant_for_transaction, mock_transaction, nil)
          expect(merchant).to eq(existing_merchant)
        end
      end

      context 'when merchant does not exist' do
        it 'creates new merchant' do
          expect { service.send(:merchant_for_transaction, mock_transaction, "entity_123") }.to change(Merchant, :count).by(1)
        end

        it 'creates merchant with correct attributes' do
          merchant = service.send(:merchant_for_transaction, mock_transaction, "entity_123")
          expect(merchant.account_id).to eq(account.id)
          expect(merchant.plaid_entity_id).to eq("entity_123")
          expect(merchant.merchant_name).to eq("Test Transaction")
        end
      end
    end
  end
end 
