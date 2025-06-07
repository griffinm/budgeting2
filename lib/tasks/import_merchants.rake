task import_merchants: :environment do
  puts "Importing merchants"
  old_merchants = <<-SQL
    SELECT 
        *
      FROM dblink('
        dbname=old_budgeting user=griffin',
        'SELECT 
         	plaid_entity_id,
			logo_url,
			merchant_name,
			website,
			address,
			city,
			state,
			zip_code,
			created_at,
			updated_at,
			friendly_name,
			account_id
        FROM merchants'
      )
      AS merchants(
        plaid_entity_id TEXT,
        logo_url TEXT,
        merchant_name TEXT,
        website TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        created_at DATE,
        updated_at DATE,
        friendly_name TEXT,
        account_id TEXT
      );
  SQL

  merchants = ActiveRecord::Base.connection.execute(old_merchants)
  puts "Importing #{merchants.count} merchants"
  account = Account.first
  merchants.each do |merchant|
    next if Merchant.find_by(merchant_name: merchant["merchant_name"]).present?

    Merchant.create!(
      account: account,
      plaid_entity_id: merchant["plaid_entity_id"],
      logo_url: merchant["logo_url"],
      merchant_name: merchant["merchant_name"],
      website: merchant["website"],
      address: merchant["address"],
      city: merchant["city"],
      state: merchant["state"],
      zip: merchant["zip_code"],
      created_at: merchant["created_at"],
      updated_at: merchant["updated_at"],
      custom_name: merchant["friendly_name"],
    )
  end

  puts "Done"
end
