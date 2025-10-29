class PlaidAccountsController < ApplicationController
  skip_before_action :require_authenticated_user!, only: [:update_all]

  def index
    @plaid_accounts = current_user.plaid_accounts.includes(:users)
  end

  # PATCH /api/plaid_accounts/:id
  def update
    @plaid_account = current_user.plaid_accounts.includes(:users).find(params[:id])
    
    if @plaid_account.update(nickname: params[:nickname])
      render partial: 'plaid_accounts/plaid_account', locals: { plaid_account: @plaid_account }
    else
      render json: { error: @plaid_account.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/users/:user_id/plaid_accounts/:id
  def create
    user_to_add = current_user.account.users.find(params[:user_id])
    plaid_account = current_user.plaid_accounts.find(params[:plaid_account_id])
    plaid_account.users << user_to_add
    render json: { message: "Access updated" }, status: :ok
  end

  # DELETE /api/users/:user_id/plaid_accounts/:id
  def destroy
    user_to_remove = current_user.account.users.find(params[:user_id])
    plaid_account = current_user.plaid_accounts.find(params[:plaid_account_id])
    plaid_account.users.delete(user_to_remove)
    render json: { message: "Access removed" }, status: :ok
  end

  # POST /api/plaid_accounts/create_link_token
  def create_link_token
    begin
      service = PlaidService.new(account_id: current_user.account_id)
      link_token = service.create_link_token(user: current_user)
      render json: { link_token: link_token }, status: :ok
    rescue => e
      Rails.logger.error("Error creating link token: #{e.message}")
      render json: { error: "Failed to create link token" }, status: :internal_server_error
    end
  end

  # POST /api/plaid_accounts/exchange_public_token
  def exchange_public_token
    public_token = params[:public_token]
    
    if public_token.blank?
      render json: { error: "Public token is required" }, status: :bad_request
      return
    end

    begin
      service = PlaidService.new(account_id: current_user.account_id)
      
      # Exchange public token for access token
      exchange_response = service.exchange_public_token(public_token)
      access_token = exchange_response.access_token
      item_id = exchange_response.item_id
      
      # Create PlaidAccessToken record
      plaid_access_token = PlaidAccessToken.create!(
        account_id: current_user.account_id,
        token: access_token,
        item_id: item_id
      )
      
      # Get account details from Plaid
      accounts_response = service.get_accounts(access_token)
      created_accounts = []
      
      # Create PlaidAccount records for each account
      accounts_response.accounts.each do |plaid_api_account|
        plaid_account = PlaidAccount.create!(
          account_id: current_user.account_id,
          plaid_access_token_id: plaid_access_token.id,
          plaid_id: plaid_api_account.account_id,
          plaid_mask: plaid_api_account.mask,
          plaid_name: plaid_api_account.name,
          plaid_official_name: plaid_api_account.official_name,
          plaid_type: plaid_api_account.type,
          plaid_subtype: plaid_api_account.subtype,
          plaid_institution_id: accounts_response.item.institution_id
        )
        
        # Associate account with current user
        PlaidAccountsUser.create!(
          plaid_account_id: plaid_account.id,
          user_id: current_user.id
        )
        
        created_accounts << plaid_account
      end
      
      # Trigger initial transaction sync
      Rails.logger.info("Triggering initial sync for newly connected accounts")
      service.sync_transactions
      
      render json: { 
        message: "Accounts connected successfully",
        accounts: created_accounts.map { |a| { id: a.id, name: a.plaid_name, mask: a.plaid_mask } }
      }, status: :ok
    rescue => e
      Rails.logger.error("Error exchanging public token: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      render json: { error: "Failed to connect accounts" }, status: :internal_server_error
    end
  end

  # GET /api/plaid_accounts/update_all
  def update_all
    token = params[:token]
    if token != ENV.fetch("UPDATE_ALL_TOKEN")
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end

    Rails.logger.info("Updating all accounts information from Plaid")
    Account.where(account_id: 1).each do |account|
      service = PlaidService.new(account_id: account.id)
      service.sync_transactions
    end
    Rails.logger.info("Update all accounts complete")
    render json: { message: "Updates complete" }, status: :ok
  end
end
