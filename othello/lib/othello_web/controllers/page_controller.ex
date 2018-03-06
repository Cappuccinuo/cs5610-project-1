defmodule OthelloWeb.PageController do
  use OthelloWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def game(conn, params) do
    render conn, "game.html", game: params["game"]
  end

  def login(conn, params) do
    render conn, "login.html"
  end
end
