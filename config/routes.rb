Rails.application.routes.draw do
  scope path: 'api' do
    get "health", to: "health#index"
    get "update_all", to: "util#update_all"

    post "signup", to: "users#signup"
    post "users/login", to: "users#login"
    get "users/current", to: "users#current"
    patch "users/current", to: "users#update"
    
    resources :users, only: [] do
      resources :plaid_accounts, only: [] do
        post "", to: "plaid_accounts#create"
        delete "", to: "plaid_accounts#destroy"
      end
    end

    resources :accounts, only: [] do
      resources :users, only: [:index]
    end

    resources :transactions, only: [:index, :update]
    resources :merchants, only: [:index, :update, :show] do
      get 'spend_stats', to: 'merchants#spend_stats'
      get 'suggest_groups', to: 'merchants#suggest_groups'
      post 'create_group', to: 'merchants#create_group'
    end

    resources :merchant_groups, only: [:index, :show, :create, :update, :destroy] do
      member do
        post 'add_merchant', to: 'merchant_groups#add_merchant'
        delete 'remove_merchant', to: 'merchant_groups#remove_merchant'
        patch 'set_primary_merchant', to: 'merchant_groups#set_primary_merchant'
        get 'spend_stats', to: 'merchant_groups#spend_stats'
      end
      collection do
        get 'suggest_groups', to: 'merchant_groups#suggest_groups'
        post 'auto_group', to: 'merchant_groups#auto_group'
      end
    end

    resources :merchant_tags, only: [:index, :update, :create, :destroy, :show] do
      get "spend_stats", to: "merchant_tags#spend_stats"
      collection do
        get 'spend_stats', to: 'merchant_tags#spend_stats'
      end
    end

    resources :plaid_accounts, only: [:index, :update] do
      collection do
        post 'create_link_token', to: 'plaid_accounts#create_link_token'
        post 'exchange_public_token', to: 'plaid_accounts#exchange_public_token'
        get 'update_all', to: 'plaid_accounts#update_all'
        get 'account_balance', to: 'account_balances#index'
        get 'account_balance_history', to: 'account_balances#history'
        get 'account_balance_history_by_type', to: 'account_balances#history_by_type'
      end
    end

    resources :sync_events, only: [] do
      collection do
        get 'latest', to: 'sync_events#latest'
      end
    end

    resources :data, only: [] do
      collection do
        get "total_for_date_range", to: "data#total_for_date_range"
        get "profit_and_loss", to: "data#profit_and_loss"
        get "spend_moving_average", to: "data#spend_moving_average"
        get "income_moving_average", to: "data#income_moving_average"
      end
    end

    resources :accounts, only: [:create] do
      resources :users, only: [:create]
    end
  end
end
