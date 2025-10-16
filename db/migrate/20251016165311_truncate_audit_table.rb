class TruncateAuditTable < ActiveRecord::Migration[8.0]
  def change
    Audited::Audit.delete_all
  end
end
