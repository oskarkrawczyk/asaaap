class CreateListItems < ActiveRecord::Migration
  def self.up
    create_table :list_items do |t|
      t.text        :title
      t.string      :status
      t.integer     :list_id
      t.timestamps
    end
  end

  def self.down
    drop_table :list_items
  end
end
