class SyncEventsController < ApplicationController
  
  # GET /api/sync_events/latest
  def latest
    @sync_event = current_user.account.plaid_sync_events.completed.latest
    render json: {
      id: @sync_event.id,
      startedAt: @sync_event.started_at,
      completedAt: @sync_event.completed_at,
    }
  end
end