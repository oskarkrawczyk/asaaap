class ListsController < ApplicationController
  
  def show
    @list = List.find_by_list_hash(params[:id])
    respond_to do |format|
      format.html # index.html
      format.xml { head :ok }
      format.json { @list.to_json }
    end
  end
  
  def new
    @list = List.new
    @list.list_hash = ActiveSupport::SecureRandom.hex(3)
    respond_to do |format|
      if @list.save
        format.html { redirect_to list_path(@list.list_hash) }
        format.xml { head :ok }
        format.json { @list.to_json }
      end
    end
  end
  
  def update
    @list = List.find_by_list_hash(params[:id])
    @list.list_items.destroy_all
    
    params[:list] = {}
    
    if params[:done]
      @done_tasks = params[:done]
      @done_tasks.each do |k,task|
        task['status'] = "done"
        task['id'] = nil
      end
      params[:list][:list_items_attributes] = @done_tasks
      @list.update_attributes(params[:list])
    end
    
    if params[:active]
      @active_tasks = params[:active]
      @active_tasks.each do |k,task|
        task['status'] = "active"
        task['id'] = nil
      end
      params[:list][:list_items_attributes] = @active_tasks
      @list.update_attributes(params[:list])
    end
    render :text => "var ok = 'ok';"
  end
  
end
