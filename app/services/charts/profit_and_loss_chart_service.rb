module Charts
  class ProfitAndLossChartService
    def initialize(account)
      @account = account
    end

    def to_png
      # TODO: Use ProfitAndLossService to get data, render with Gruff
      # data = ProfitAndLossService.new(account_id: @account.id).profit_and_loss
      # chart = Gruff::Bar.new(600)
      # chart.title = "Profit & Loss"
      # ...
      # chart.to_blob
    end
  end
end
