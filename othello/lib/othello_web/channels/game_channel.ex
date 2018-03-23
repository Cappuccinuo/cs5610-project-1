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

  def handle_in("restart", %{}, socket) do
    curr_name = socket.assigns.curr_name
    resp = Game.restart_game curr_name
    broadcast! socket, "new:state", resp
    {:reply, {:ok, resp}, socket}
  end

  def handle_info({:after_join, resp}, socket) do
    broadcast! socket, "new:user", resp
    {:noreply, socket}
  end

  def terminate(reason, socket) do
    user_name = socket.assigns.current_user
    game = Game.get_state socket.assigns.curr_name
    if game && Enum.member? game.players, user_name do
      game = %{game | online_players: game.online_players - 1} 
      if game.online_players > 0 do
        # there is remaining online player
        resp = Game.update_state(%{"state" => game}, socket.assigns.curr_name)
        broadcast! socket, "user:leave", %{"msg" => user_name <> " (player) leaves.", "type" => "warning"}
        socket
      else
        # no online player, close and delete game table
        :ok = Game.delete_state socket.assigns.curr_name
        broadcast! socket, "table:close", %{"msg" => user_name <> " has left. Table closed", "type" => "warning"}
        socket
      end
    else
      if game && Enum.member? game.speculators, user_name do
        game = %{game | speculators: List.delete(game.speculators, user_name)}
        resp = Game.update_state(%{"state" => game}, socket.assigns.curr_name)
        broadcast! socket, "user:leave", %{"msg" => user_name <> " leaves.", "type" => "info"}
        socket
      else
        broadcast! socket, "user:leave", %{"msg" => "Anonymous leaves.", "type" => "info"}
        socket
      end
    end
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
