Rails.application.routes.draw do
  scope path: 'api' do
    get "health", to: "health#index"

    post "users/login", to: "users#login"
    get "users/current", to: "users#current"

    resources :transactions, only: [:index, :update]
    resources :merchants, only: [:index, :update, :show] do
      get 'spend_stats', to: 'merchants#spend_stats'
    end
    resources :merchant_tags, only: [:index, :update, :create, :destroy]
    resources :data, only: [] do
      collection do
        get "monthly_spend", to: "data#monthly_spend"
        get "monthly_income", to: "data#monthly_income"
        get "average_income", to: "data#average_income"
        get "average_expense", to: "data#average_expense"
        get "profit_and_loss", to: "data#profit_and_loss"
      end
    end

    resources :accounts, only: [:create] do
      resources :users, only: [:create]
    end
  end
end
