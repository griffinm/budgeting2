class TagReportTag < ApplicationRecord
  belongs_to :tag_report
  belongs_to :tag

  validates :role, inclusion: { in: %w[include omit] }
  validates :tag_id, uniqueness: { scope: :tag_report_id }
end
