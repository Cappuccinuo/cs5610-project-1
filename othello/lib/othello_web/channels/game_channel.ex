defmodule OthelloWeb.Gamechannel do
  use OthelloWeb, :channel
  alias Othello.Game

  def join("gamechannel:" <> name, payload, socket) do
    if authorized?(payload) do
      current_user = socket.assigns.current_user
      curr_name = name
      game = Game.join_game(curr_name, current_user)
      socket = assign(socket, :curr_name, curr_name)
      {:ok, %{"state" => game}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("move", %{"index" => i}, socket) do
    curr_name = socket.assigns.curr_name
    case Game.simulate_next_state(curr_name, i) do
      {true, game} ->
        {:reply, {:ok, %{"state" => game}}, socket}
      {false, game} ->
        {:reply, {:error, %{"state" => game}}, socket}
    end

  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
