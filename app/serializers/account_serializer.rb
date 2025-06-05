class AccountSerializer < ActiveModel::Serializer
  attributes :id,
    :created_at,
    :updated_at
end
