class CreateLists < ActiveRecord::Migration
  def self.up
    create_table :lists do |t|
      t.string      :name
      t.string      :list_hash
      t.timestamps
    end
    add_index :lists, :list_hash, :unique => true
  end

  def self.down
    drop_table :lists
  end
end
