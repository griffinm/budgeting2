require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      user = build(:user)
      expect(user).to be_valid
    end

    it 'is not valid without an email' do
      user = build(:user, email: nil)
      expect(user).not_to be_valid
    end

    it 'is not valid without a password' do
      user = build(:user, password: nil)
      expect(user).not_to be_valid
    end
  end

  describe 'factory' do
    it 'creates a valid user' do
      user = create(:user)
      expect(user).to be_persisted
      expect(user.email).to match(/user\d+@example\.com/)
    end

    it 'creates a user with name when using with_name trait' do
      user = create(:user, :with_name)
      expect(user.first_name).to be_present
      expect(user.last_name).to be_present
    end
  end
end 