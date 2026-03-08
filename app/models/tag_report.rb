class TagReport < ApplicationRecord
  acts_as_paranoid

  belongs_to :account
  belongs_to :user
  has_many :tag_report_tags, dependent: :destroy

  accepts_nested_attributes_for :tag_report_tags, allow_destroy: true

  validates :name, presence: true
  validate :at_least_one_tag

  private

  def at_least_one_tag
    active_tags = tag_report_tags.reject(&:marked_for_destruction?)
    errors.add(:base, "Must have at least one tag") if active_tags.empty?
  end
end
