class PlaidAccountsController < ApplicationController
  skip_before_action :require_authenticated_user!, only: [:update_all]

  def index
    @plaid_accounts = current_user.plaid_accounts.includes(:users, :plaid_access_token).distinct.order(nickname: :desc).order(plaid_official_name: :asc)
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
  # Optional param `plaid_access_token_id` opens Link in update mode to repair
  # an existing connection instead of creating a new one.
  def create_link_token
    begin
      service = PlaidService.new(account_id: current_user.account_id)

      access_token = nil
      if params[:plaid_access_token_id].present?
        plaid_access_token = current_user.account.plaid_access_tokens.find(params[:plaid_access_token_id])
        access_token = plaid_access_token.token
      end

      link_token = service.create_link_token(user: current_user, access_token: access_token)
      render json: { link_token: link_token }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Connection not found" }, status: :not_found
    rescue => e
      Rails.logger.error("Error creating link token: #{e.message}")
      render json: { error: "Failed to create link token" }, status: :internal_server_error
    end
  end

  # POST /api/plaid_accounts/reconnect
  # Called after Link update mode succeeds. Clears the error state on the Item
  # and triggers a fresh sync so transactions resume from the saved cursor.
  def reconnect
    if params[:plaid_access_token_id].blank?
      render json: { error: "plaid_access_token_id is required" }, status: :bad_request
      return
    end

    begin
      plaid_access_token = current_user.account.plaid_access_tokens.find(params[:plaid_access_token_id])
      plaid_access_token.mark_healthy!

      service = PlaidService.new(account_id: current_user.account_id)
      service.sync_transactions
      service.sync_balances(plaid_types: PlaidAccount::LOAN_ACCOUNT_TYPES + PlaidAccount::INVESTMENT_ACCOUNT_TYPES)

      render json: { message: "Connection restored", status: plaid_access_token.reload.status }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Connection not found" }, status: :not_found
    rescue => e
      Rails.logger.error("Error reconnecting Plaid item: #{e.message}")
      render json: { error: "Failed to reconnect" }, status: :internal_server_error
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
      institution_id = accounts_response.item.institution_id
      created_accounts = []
      skipped_accounts = []

      # Create PlaidAccount records for each account, skipping any that already
      # exist for this account. A duplicate here means the user is re-adding an
      # institution they already connected (the classic cause of duplicate
      # accounts/transactions) — they should use "Reconnect" instead.
      accounts_response.accounts.each do |plaid_api_account|
        if duplicate_plaid_account?(institution_id, plaid_api_account)
          Rails.logger.warn("Skipping duplicate Plaid account #{plaid_api_account.account_id} (mask #{plaid_api_account.mask})")
          skipped_accounts << plaid_api_account
          next
        end

        plaid_account = PlaidAccount.create!(
          account_id: current_user.account_id,
          plaid_access_token_id: plaid_access_token.id,
          plaid_id: plaid_api_account.account_id,
          plaid_mask: plaid_api_account.mask,
          plaid_name: plaid_api_account.name,
          plaid_official_name: plaid_api_account.official_name,
          plaid_type: plaid_api_account.type,
          plaid_subtype: plaid_api_account.subtype,
          plaid_institution_id: institution_id
        )

        # Associate account with current user
        PlaidAccountsUser.create!(
          plaid_account_id: plaid_account.id,
          user_id: current_user.id
        )

        created_accounts << plaid_account
      end

      # Every account was a duplicate: this Item is redundant. Discard it so we
      # don't leave a dangling Plaid Item, and tell the user to use Reconnect.
      if created_accounts.empty? && skipped_accounts.any?
        begin
          service.remove_item(access_token)
        rescue => remove_error
          Rails.logger.warn("Failed to remove redundant Plaid item: #{remove_error.message}")
        end
        plaid_access_token.destroy
        render json: {
          error: "These accounts are already connected. Use \"Reconnect\" on the account to repair its connection instead of adding it again."
        }, status: :unprocessable_entity
        return
      end

      # Trigger initial transaction sync
      Rails.logger.info("Triggering initial sync for newly connected accounts")
      service.sync_transactions
      service.sync_balances(plaid_types: PlaidAccount::LOAN_ACCOUNT_TYPES + PlaidAccount::INVESTMENT_ACCOUNT_TYPES)

      render json: {
        message: "Accounts connected successfully",
        accounts: created_accounts.map { |a| { id: a.id, name: a.plaid_name, mask: a.plaid_mask } },
        skipped: skipped_accounts.map { |a| { name: a.name, mask: a.mask } }
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
      service.sync_balances(plaid_types: PlaidAccount::LOAN_ACCOUNT_TYPES + PlaidAccount::INVESTMENT_ACCOUNT_TYPES)
    end
    Rails.logger.info("Update all accounts complete")
    render json: { message: "Updates complete" }, status: :ok
  end

  private

  # An incoming Plaid account is a duplicate when an active PlaidAccount already
  # exists for this account at the same institution with the same mask and
  # subtype. Plaid assigns a fresh account_id for a re-added Item, so plaid_id
  # cannot be used to detect this.
  def duplicate_plaid_account?(institution_id, plaid_api_account)
    PlaidAccount.active
      .where(account_id: current_user.account_id)
      .where(plaid_institution_id: institution_id)
      .where(plaid_mask: plaid_api_account.mask)
      .where(plaid_subtype: plaid_api_account.subtype)
      .exists?
  end
end
