defmodule OthelloWeb.GamechannelChannel do
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
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (gamechannel:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
