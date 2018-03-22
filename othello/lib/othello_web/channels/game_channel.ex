defmodule OthelloWeb.Gamechannel do
  use OthelloWeb, :channel
  alias Othello.Game

  def join("gamechannel:" <> name, payload, socket) do
    if authorized?(payload) do
      current_user = socket.assigns.current_user
      curr_name = name
      resp = Game.join_game(curr_name, current_user)
      socket = assign(socket, :curr_name, curr_name)
      send(self, {:after_join, resp})
      {:ok, %{"state" => resp["state"]}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("move", %{"index" => i}, socket) do
    curr_name = socket.assigns.curr_name
    case Game.simulate_next_state(curr_name, i) do
      {true, resp} ->
        broadcast! socket, "new:state", resp
        {:reply, {:ok, resp}, socket}
      {false, resp} ->
        {:reply, {:error, resp}, socket}
    end
  end

  def handle_info({:after_join, resp}, socket) do
    broadcast! socket, "new:user", resp
    {:noreply, socket}
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
