class UserSerializer < ActiveModel::Serializer
  attributes :id,
    :email,
    :first_name,
    :last_name,
    :created_at,
    :updated_at
end
