json.id tag_report.id
json.name tag_report.name
json.description tag_report.description
json.userId tag_report.user_id
json.accountId tag_report.account_id
json.includedTagIds tag_report.tag_report_tags.select { |t| t.role == 'include' }.map(&:tag_id)
json.omittedTagIds tag_report.tag_report_tags.select { |t| t.role == 'omit' }.map(&:tag_id)
json.createdAt tag_report.created_at
json.updatedAt tag_report.updated_at
