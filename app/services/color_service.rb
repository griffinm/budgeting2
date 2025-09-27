class ColorService
  def initialize(account:)
    @account = account
  end

  def next_color()
    used_colors = @account.merchant_tags.pluck(:color)
    available_colors = Color.where.not(hex: used_colors).order('RANDOM()').first
    available_colors.hex
  end
  
end
