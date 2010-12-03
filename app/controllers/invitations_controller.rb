class InvitationsController < ApplicationController

  def new
  end

  def create
    respond_to do |format|
      if Invite.invitation(params[:invitation]).deliver
        format.html { redirect_to list_path(params[:invitation][:list_hash]) }
        format.xml { head :ok }
        format.json { params[:invitation].to_json }
      end
    end
  end

end
