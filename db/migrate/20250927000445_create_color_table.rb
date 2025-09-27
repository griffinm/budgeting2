class CreateColorTable < ActiveRecord::Migration[8.0]
  def up
    create_table :colors do |t|
      t.string :hex
      t.string :rgb
      t.string :hsl
      t.string :text
      t.timestamps
    end

    color_list = ColorGenService.new.big_palette(100, min_delta_e: 25)
    color_list.each do |color|
      Color.create(hex: color[:hex], rgb: color[:rgb], hsl: color[:hsl], text: color[:text])
    end

    Account.all.each do |account|
      account.merchant_tags.where(account: account).each do |merchant_tag|
        selected_color = ColorService.new(account: merchant_tag.account).next_color
        merchant_tag.update(color: selected_color.gsub('#', ''))
      end
    end

  end

  def down
    drop_table :colors
  end
end
