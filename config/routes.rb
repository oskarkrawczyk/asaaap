Todolist::Application.routes.draw do
  root :to => "home#index"
  resources :lists, :invitations
  
end
