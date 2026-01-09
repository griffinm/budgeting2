class AccountBalancesController < ApplicationController

  # GET /api/account_balances
  def index
    @account_balances = current_user.account_balances.latest_per_account.includes(:plaid_account)
  end

  # GET /api/account_balances/history
  def history
    plaid_account_id = params[:plaid_account_id]
    time_range = params[:time_range]

    plaid_accounts_user = current_user.plaid_accounts_users
      .includes(:plaid_account)
      .find_by(plaid_account_id: plaid_account_id)

    return render json: { error: 'Account not found' }, status: :not_found unless plaid_accounts_user

    @account_balances = AccountBalance
      .where(plaid_accounts_user_id: plaid_accounts_user.id)
      .order(created_at: :asc)

    # Apply time filter
    unless time_range == 'all' || time_range.nil?
      months = case time_range
      when '1m' then 1
      when '3m' then 3
      when '6m' then 6
      when '12m' then 12
      else 6
      end

      @account_balances = @account_balances.where('created_at >= ?', months.months.ago)
    end
  end

  # GET /api/account_balances/history_by_type
  # params: account_type ('deposit', 'credit', 'loan', 'investment'), time_range
  def history_by_type
    account_type = params[:account_type]
    time_range = params[:time_range]

    # Validate account_type
    valid_types = ['deposit', 'credit', 'loan', 'investment']
    return render json: { error: 'Invalid account type' }, status: :bad_request unless valid_types.include?(account_type)

    # Get all plaid_accounts_users for this user that match the account type
    plaid_accounts_users = current_user.plaid_accounts_users
      .joins(:plaid_account)
      .includes(:plaid_account)
      .where(plaid_accounts: { plaid_type: PlaidAccount.types_for_category(account_type) })

    plaid_accounts_user_ids = plaid_accounts_users.map(&:id)

    # Get all account_balances for these accounts
    query = AccountBalance
      .where(plaid_accounts_user_id: plaid_accounts_user_ids)

    # Apply time filter
    unless time_range == 'all' || time_range.nil?
      months = case time_range
      when '1m' then 1
      when '3m' then 3
      when '6m' then 6
      when '12m' then 12
      else 6
      end

      query = query.where('created_at >= ?', months.months.ago)
    end

    # Group by date and sum balances
    # Using DATE to group by calendar date
    @aggregated_balances = query
      .select("DATE(created_at) as date, SUM(current_balance) as total_balance")
      .group("DATE(created_at)")
      .order("date ASC")
  end

end
