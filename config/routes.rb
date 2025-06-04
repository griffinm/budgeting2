Rails.application.routes.draw do
  scope path: 'api' do
    get "health", to: "health#index"

    resources :accounts, only: [:create] do
      resources :users, only: [:create]
    end
  end
end
