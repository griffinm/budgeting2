class HealthController < ApplicationController
  skip_before_action :require_authenticated_user!

  def index
    render json: { status: "ok" }
  end
end
