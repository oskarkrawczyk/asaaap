class ListsController < ApplicationController
  
  def index
    
  end
  
  def show
    @list = List.find_by_list_hash(params[:id])
  end
  
  def new
    @list = List.new
    @list.list_items.build
    @list.list_hash = Digest::MD5.hexdigest({Time.now.to_s, rand}.to_s)
    @list.save
    redirect_to list_path(@list.list_hash)
  end
  
  def create
    
  end
  
  def update
    @list = List.find_by_list_hash(params[:id])
    if @list.update_attributes(params[:list])
      flash[:notice] = "List updated"
      redirect_to list_path(@list.list_hash)
    else
      render :action => :show
    end
  end
  
end
