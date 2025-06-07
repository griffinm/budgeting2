Rails.application.routes.draw do
  scope path: 'api' do
    get "health", to: "health#index"

    post "users/login", to: "users#login"
    get "users/current", to: "users#current"

    resources :transactions, only: [:index]

    resources :accounts, only: [:create] do
      resources :users, only: [:create]
    end
  end
end
