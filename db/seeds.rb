email = 'griffin.mahoney@gmail.com'

existing_user = User.find_by(email: email)

puts "Seeding user #{email}"

if existing_user.nil?
  account = Account.create
  user = User.create(
    email: email,
    first_name: 'Griffin',
    last_name: 'Mahoney',
    password: 'password',
    account: account
  )

  puts "User #{email} created with account #{account.id}"
else
  puts "User #{email} already exists"
end

puts "Seeding complete"
