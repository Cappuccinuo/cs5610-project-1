defmodule Othello.Game do
  use Agent

  # helper function to generate a new state with input user name as first player
  def new_game(user_name) do
    colors = for _ <- 1..64, do: 0
    %{colors: colors, turn: 0, players: [user_name], winner: nil, speculators: []}
  end

  # join game
  # Agent
  #   :games => %{ game_name => game_state }
  def join_game(curr_name, user_name) do
    games = get_all_games
    curr_game = Map.get(games, curr_name)
    if curr_game do
      if Kernel.length(curr_game.players) <= 1 do
        # second player
        curr_game = %{curr_game | players: curr_game.players ++ [user_name]}
        new_games = %{games | curr_name => curr_game}
        :ok = Agent.update(:games, fn last -> new_games end)
        curr_game
      else
        # speculator
        curr_game = %{curr_game | speculators: curr_game.speculators ++ [user_name]}
        new_games = %{games | curr_name => curr_game}
        :ok = Agent.update(:games, fn last -> new_games end)
        curr_game
      end
    else
      new_games = Map.put(games, curr_name, new_game(user_name))
      :ok = Agent.update(:games, fn last -> new_games end)
      new_game(user_name)
    end
  end

  def get_all_games do
    try do
      Agent.get(:games, &(&1))
    catch
      exit, _ ->
        # no game currently exists, thus initializing Agent here
        {_, game} = Agent.start(fn -> %{} end, name: :games)
        %{}
    end
  end

  def get_state(curr_name) do
    get_all_games |> Map.get(curr_name)
  end

  
end