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
    allow(ENV).to receive(:[]).with("PLAID_SECRET").and_return("test_secret")
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
      allow(mock_sync_response).to receive(:accounts).and_return([])
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
          client_id: "test_client_id",
          secret: "test_secret",
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
            merchant_name: nil,
            authorized_date: Date.current,
            date: Date.current,
            datetime: nil,
            check_number: nil,
            iso_currency_code: "USD",
            pending: false,
            personal_finance_category: mock_personal_finance_category,
            payment_channel: "online",
            merchant_entity_id: "entity_123",
            logo_url: nil,
            category: ["Food and Drink"]
          )
        end

        before do
          allow(mock_personal_finance_category).to receive(:primary).and_return("FOOD_AND_DRINK")
          allow(mock_personal_finance_category).to receive(:detailed).and_return("RESTAURANTS")
          allow(mock_personal_finance_category).to receive(:confidence_level).and_return("HIGH")
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

        context 'when Plaid categorizes the transaction as income' do
          before do
            allow(mock_transaction).to receive(:amount).and_return(-2000.00)
            allow(mock_personal_finance_category).to receive(:primary).and_return("INCOME")
            allow(mock_personal_finance_category).to receive(:detailed).and_return("INCOME_WAGES")
          end

          it 'creates the transaction as income classified by plaid_category' do
            service.sync_transactions
            transaction = PlaidTransaction.last

            expect(transaction.transaction_type).to eq("income")
            expect(transaction.classification_source).to eq("plaid_category")
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
            merchant_name: nil,
            authorized_date: Date.current,
            date: Date.current,
            datetime: nil,
            check_number: nil,
            iso_currency_code: "USD",
            pending: false,
            personal_finance_category: double(primary: "FOOD_AND_DRINK", detailed: "RESTAURANTS", confidence_level: "HIGH"),
            payment_channel: "online",
            merchant_entity_id: "entity_123",
            logo_url: nil,
            category: ["Food and Drink"]
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

        context 'when the transaction was manually classified' do
          let(:merchant_tag) { create(:merchant_tag, account: account, user: user) }
          let!(:existing_transaction) do
            create(:plaid_transaction, :income,
              account: account,
              plaid_id: "txn_123",
              plaid_account: plaid_account,
              classification_source: 'user',
              merchant_tag_id: merchant_tag.id)
          end

          it 'preserves the manual classification' do
            service.sync_transactions
            existing_transaction.reload

            expect(existing_transaction.name).to eq("Updated Transaction")
            expect(existing_transaction.transaction_type).to eq("income")
            expect(existing_transaction.classification_source).to eq("user")
            expect(existing_transaction.merchant_tag_id).to eq(merchant_tag.id)
          end
        end

        context 'when the transaction is a split parent and the amount changed' do
          before do
            create(:plaid_transaction, :split_child, parent: existing_transaction, amount: 50.00)
            existing_transaction.update!(split: true)
          end

          it 'still updates the parent but warns about the drift' do
            allow(Rails.logger).to receive(:warn).and_call_original

            service.sync_transactions

            expect(existing_transaction.reload.amount).to eq(-75.00)
            expect(Rails.logger).to have_received(:warn)
              .with(a_string_including("Split transaction #{existing_transaction.id} amount changed"))
          end
        end
      end

      context 'when there are removed transactions' do
        let!(:existing_transaction) { create(:plaid_transaction, account: account, plaid_id: "txn_123") }
        let(:mock_transaction) { double(transaction_id: "txn_123", merchant_name: nil) }

        before do
          allow(mock_sync_response).to receive(:removed).and_return([mock_transaction])
        end

        it 'removes the transaction' do
          expect { service.sync_transactions }.to change(PlaidTransaction, :count).by(-1)
        end

        context 'when the removed transaction is a split parent' do
          before do
            create(:plaid_transaction, :split_child, parent: existing_transaction, amount: 30.00)
            create(:plaid_transaction, :split_child, parent: existing_transaction, amount: 20.00)
            existing_transaction.update!(split: true)
          end

          it 'removes the children along with the parent' do
            expect { service.sync_transactions }.to change(PlaidTransaction, :count).by(-3)
          end
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

    context 'when an archived account shares a token with an active sibling' do
      let(:archived_account) { create(:plaid_account, :archived, account: account, plaid_access_token: plaid_access_token) }
      let(:active_sibling) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }
      let!(:archived_pau) { create(:plaid_accounts_user, user: user, plaid_account: archived_account) }
      let!(:active_pau) { create(:plaid_accounts_user, user: user, plaid_account: active_sibling) }

      let(:mock_added_for_archived) do
        double(account_id: archived_account.plaid_id, transaction_id: 'txn_archived_1')
      end

      let(:mock_added_for_active) do
        double(
          account_id: active_sibling.plaid_id,
          transaction_id: 'txn_active_1',
          amount: -50.00,
          name: 'Active Sibling Transaction',
          merchant_name: nil,
          authorized_date: Date.current,
          date: Date.current,
          datetime: nil,
          check_number: nil,
          iso_currency_code: 'USD',
          pending: false,
          personal_finance_category: mock_personal_finance_category,
          payment_channel: 'online',
          merchant_entity_id: 'entity_123',
          logo_url: nil,
          category: ['Food and Drink']
        )
      end

      before do
        allow(mock_personal_finance_category).to receive(:primary).and_return('FOOD_AND_DRINK')
        allow(mock_personal_finance_category).to receive(:detailed).and_return('RESTAURANTS')
        allow(mock_personal_finance_category).to receive(:confidence_level).and_return('HIGH')
      end

      it 'skips added transactions for the archived account but keeps the sibling' do
        allow(mock_sync_response).to receive(:added).and_return([mock_added_for_archived, mock_added_for_active])

        expect { service.sync_transactions }.to change(PlaidTransaction, :count).by(1)
        expect(PlaidTransaction.last.plaid_account).to eq(active_sibling)
      end

      it 'does not modify existing transactions on the archived account' do
        existing = create(:plaid_transaction, account: account, plaid_account: archived_account,
                          plaid_id: 'txn_archived_1', amount: -10.00)
        allow(mock_sync_response).to receive(:modified)
          .and_return([double(account_id: archived_account.plaid_id, transaction_id: 'txn_archived_1')])

        service.sync_transactions

        expect(existing.reload.amount).to eq(-10.00)
      end

      it 'does not remove transactions from the archived account' do
        create(:plaid_transaction, account: account, plaid_account: archived_account, plaid_id: 'txn_archived_1')
        allow(mock_sync_response).to receive(:removed)
          .and_return([double(transaction_id: 'txn_archived_1')])

        expect { service.sync_transactions }.not_to change(PlaidTransaction, :count)
      end

      it 'creates balance snapshots only for the unarchived sibling' do
        balances = double(current: 100.0, available: 90.0, limit: nil)
        allow(mock_sync_response).to receive(:accounts).and_return([
          double(account_id: archived_account.plaid_id, balances: balances),
          double(account_id: active_sibling.plaid_id, balances: balances)
        ])

        expect { service.sync_transactions }.to change(AccountBalance, :count).by(1)
        expect(AccountBalance.last.plaid_accounts_user).to eq(active_pau)
      end
    end

    context 'when every account on a token is archived' do
      let!(:archived_account) { create(:plaid_account, :archived, account: account, plaid_access_token: plaid_access_token) }

      before do
        plaid_access_token.update!(next_cursor: 'frozen_cursor')
      end

      it 'does not call the Plaid API' do
        expect(mock_api_client).not_to receive(:transactions_sync)
        service.sync_transactions
      end

      it 'does not create a sync event' do
        expect { service.sync_transactions }.not_to change(PlaidSyncEvent, :count)
      end

      it 'leaves the cursor untouched' do
        service.sync_transactions
        expect(plaid_access_token.reload.next_cursor).to eq('frozen_cursor')
      end

      it 'resumes syncing after the account is unarchived' do
        archived_account.update!(archived: false)

        expect { service.sync_transactions }.to change(PlaidSyncEvent, :count).by(1)
        expect(plaid_access_token.reload.next_cursor).to eq('next_cursor_123')
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

    context 'when a Plaid Item has a broken connection' do
      let(:login_required_error) do
        Plaid::ApiError.new(response_body: '{"error_code":"ITEM_LOGIN_REQUIRED"}')
      end

      before do
        plaid_access_token
        allow(mock_api_client).to receive(:transactions_sync).and_raise(login_required_error)
      end

      it 'flags the access token for reconnection' do
        service.sync_transactions
        expect(plaid_access_token.reload.status).to eq('login_required')
        expect(plaid_access_token.error_code).to eq('ITEM_LOGIN_REQUIRED')
      end

      it 'marks the sync event as ERROR instead of raising' do
        expect { service.sync_transactions }.not_to raise_error
        expect(PlaidSyncEvent.last.event_type).to eq('ERROR')
      end

      it 'still syncs other healthy Items' do
        healthy_token = create(:plaid_access_token, account: account)
        # The first Item (plaid_access_token) fails; the second succeeds.
        call_count = 0
        allow(mock_api_client).to receive(:transactions_sync) do
          call_count += 1
          raise login_required_error if call_count == 1
          mock_sync_response
        end

        service.sync_transactions

        expect(plaid_access_token.reload.status).to eq('login_required')
        expect(healthy_token.reload.status).to eq('active')
      end
    end

    context 'when a sync succeeds' do
      before { plaid_access_token }

      it 'marks the access token healthy and records the sync time' do
        plaid_access_token.mark_error!('ITEM_LOGIN_REQUIRED')
        service.sync_transactions

        expect(plaid_access_token.reload.status).to eq('active')
        expect(plaid_access_token.error_code).to be_nil
        expect(plaid_access_token.last_synced_at).to be_present
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
        merchant_name: nil,
        authorized_date: Date.current,
        date: Date.current,
        datetime: nil,
        check_number: nil,
        iso_currency_code: "USD",
        pending: false,
        personal_finance_category: double(primary: "FOOD_AND_DRINK", detailed: "RESTAURANTS", confidence_level: "HIGH"),
        payment_channel: "online",
        merchant_entity_id: "entity_123",
        logo_url: nil,
        category: ["Food and Drink"]
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
      let(:mock_removed_transaction) { double(transaction_id: "txn_123", merchant_name: nil) }

      it 'removes the transaction' do
        expect { service.send(:remove_transactions, [mock_removed_transaction], plaid_sync_event) }.to change(PlaidTransaction, :count).by(-1)
      end

      it 'logs the operation' do
        expect(Rails.logger).to receive(:info).with("Removing 1 transactions for account #{account.id} sync event #{plaid_sync_event.id}")
        service.send(:remove_transactions, [mock_removed_transaction], plaid_sync_event)
      end

      context 'when transaction does not exist' do
        let(:mock_removed_transaction) { double(transaction_id: "non_existent", merchant_name: nil) }

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

  describe '#sync_balances' do
    let(:mock_api_client) { instance_double(Plaid::PlaidApi) }
    let(:mock_accounts_response) { instance_double(Plaid::AccountsGetResponse) }

    before do
      allow(service).to receive(:api_client).and_return(mock_api_client)
      plaid_account_user # ensure the user-account association exists
    end

    context 'when access token has investment accounts' do
      let(:plaid_account) do
        create(:plaid_account,
          account: account,
          plaid_access_token: plaid_access_token,
          plaid_type: 'investment',
          plaid_subtype: '401k')
      end

      let(:mock_balance) do
        double(current: 103_930.23, available: nil, limit: nil)
      end

      let(:mock_plaid_api_account) do
        double(
          account_id: plaid_account.plaid_id,
          name: plaid_account.plaid_name,
          type: 'investment',
          subtype: '401k',
          balances: mock_balance
        )
      end

      before do
        allow(mock_api_client).to receive(:accounts_get).and_return(mock_accounts_response)
        allow(mock_accounts_response).to receive(:accounts).and_return([mock_plaid_api_account])
      end

      it 'calls Plaid accounts_get API' do
        expect(mock_api_client).to receive(:accounts_get)
        service.sync_balances
      end

      it 'creates an account balance record' do
        expect { service.sync_balances }.to change(AccountBalance, :count).by(1)
      end

      it 'sets the correct balance values' do
        service.sync_balances
        balance = AccountBalance.last

        expect(balance.current_balance).to eq(103_930.23)
        expect(balance.available_balance).to eq(0.0)
        expect(balance.limit).to be_nil
      end

      it 'creates balance for each user associated with the plaid account' do
        second_user = create(:user, account: account)
        create(:plaid_accounts_user, user: second_user, plaid_account: plaid_account)

        expect { service.sync_balances }.to change(AccountBalance, :count).by(2)
      end
    end

    context 'when access token has only depository accounts' do
      let(:plaid_account) do
        create(:plaid_account,
          account: account,
          plaid_access_token: plaid_access_token,
          plaid_type: 'depository',
          plaid_subtype: 'checking')
      end

      let(:mock_balance) do
        double(current: 5_000.00, available: 4_800.00, limit: nil)
      end

      let(:mock_plaid_api_account) do
        double(
          account_id: plaid_account.plaid_id,
          name: plaid_account.plaid_name,
          type: 'depository',
          subtype: 'checking',
          balances: mock_balance
        )
      end

      before do
        allow(mock_api_client).to receive(:accounts_get).and_return(mock_accounts_response)
        allow(mock_accounts_response).to receive(:accounts).and_return([mock_plaid_api_account])
      end

      it 'still syncs balances for non-investment accounts' do
        expect { service.sync_balances }.to change(AccountBalance, :count).by(1)
      end

      it 'sets the correct balance values' do
        service.sync_balances
        balance = AccountBalance.last

        expect(balance.current_balance).to eq(5_000.00)
        expect(balance.available_balance).to eq(4_800.00)
      end
    end

    context 'when Plaid API returns an error' do
      before do
        allow(mock_api_client).to receive(:accounts_get).and_raise(StandardError.new("Plaid API error"))
        plaid_access_token # ensure token exists
      end

      it 'does not raise an error' do
        expect { service.sync_balances }.not_to raise_error
      end

      it 'does not create any balance records' do
        expect { service.sync_balances }.not_to change(AccountBalance, :count)
      end
    end

    context 'when the plaid account is archived' do
      let(:plaid_account) do
        create(:plaid_account, :archived,
          account: account,
          plaid_access_token: plaid_access_token,
          plaid_type: 'investment',
          plaid_subtype: '401k')
      end

      let(:active_sibling) do
        create(:plaid_account,
          account: account,
          plaid_access_token: plaid_access_token,
          plaid_type: 'investment',
          plaid_subtype: 'ira')
      end

      let!(:active_pau) { create(:plaid_accounts_user, user: user, plaid_account: active_sibling) }

      let(:mock_balance) { double(current: 1_000.00, available: nil, limit: nil) }

      before do
        allow(mock_api_client).to receive(:accounts_get).and_return(mock_accounts_response)
        allow(mock_accounts_response).to receive(:accounts).and_return([
          double(account_id: plaid_account.plaid_id, balances: mock_balance),
          double(account_id: active_sibling.plaid_id, balances: mock_balance)
        ])
      end

      it 'creates balances only for the unarchived sibling' do
        expect { service.sync_balances }.to change(AccountBalance, :count).by(1)
        expect(AccountBalance.last.plaid_accounts_user).to eq(active_pau)
      end
    end

    context 'when every account on the token is archived' do
      let!(:plaid_account) do
        create(:plaid_account, :archived, account: account, plaid_access_token: plaid_access_token)
      end

      it 'does not call the Plaid API' do
        expect(mock_api_client).not_to receive(:accounts_get)
        service.sync_balances
      end
    end

    context 'when plaid account has no matching local record' do
      before do
        allow(mock_api_client).to receive(:accounts_get).and_return(mock_accounts_response)
        allow(mock_accounts_response).to receive(:accounts).and_return([
          double(
            account_id: 'unknown_plaid_id',
            name: 'Unknown Account',
            type: 'investment',
            subtype: '401k',
            balances: double(current: 50_000.00, available: nil, limit: nil)
          )
        ])
        plaid_access_token
      end

      it 'skips accounts without local plaid_account records' do
        expect { service.sync_balances }.not_to change(AccountBalance, :count)
      end
    end
  end
end
