defmodule OthelloWeb.SessionController do
  use OthelloWeb, :controller


  def create(conn, %{"user_name" => user_name, "game" => game}) do
    conn = conn
            |> put_session(:user_name, user_name)
            |> put_flash(:info, "Welcome, #{user_name}")
            
    if String.length(game) > 0 do
      redirect conn, to: page_path(conn, :game, game)
    else 
      redirect conn, to: page_path(conn, :index)
    end
  end

  def delete(conn, _params) do
    conn
      |> delete_session(:user_name)
      |> put_flash(:info, "Logged out")
      |> redirect(to: page_path(conn, :index))
  end
end