class Invite < ActionMailer::Base
  default :from => "asaptodo@gmail.com"
  
  def invitation(invitation)  
    @list = List.find_by_list_hash(invitation[:list_hash])
    @invitation = invitation
    mail(:from => "system", :to => invitation[:email], :subject => "ASAP TO DO invitation")  
  end
end
