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
        # only one player in room
        if Enum.member? curr_game.players, user_name do
          # already first player
          %{"state" => curr_game, "msg" => user_name <> "is back.", "type" => "success"}
        else
          # second player
          curr_game = %{curr_game | players: curr_game.players ++ [user_name]}
          colors = curr_game.colors 
                    |> List.update_at(27, fn _ -> 1 end)
                    |> List.update_at(28, fn _ -> 2 end)
                    |> List.update_at(35, fn _ -> 2 end)
                    |> List.update_at(36, fn _ -> 1 end)
          curr_game = %{curr_game | colors: colors}
          new_games = %{games | curr_name => curr_game}
          :ok = Agent.update(:games, fn last -> new_games end)
          %{"state" => curr_game, "msg" => user_name <> " joined game.", "type" => "success"}
        end
      else
        # two players in room
        if Enum.member? curr_game.players, user_name do
          # already a player
          %{"state" => curr_game, "msg" => user_name <> " is back.", "type" => "success"}
        else
          # speculator
          if String.length(user_name) > 0 do
            curr_game = %{curr_game | speculators: curr_game.speculators ++ [user_name]} 
            new_games = %{games | curr_name => curr_game}
            :ok = Agent.update(:games, fn last -> new_games end)
            %{"state" => curr_game, "msg" => user_name <> " is watching.", "type" => "info"}
          else
            %{"state" => curr_game, "msg" => "Anonymous is watching.", "type" => "info"}
          end 
        end
      end
    else
      new_games = Map.put(games, curr_name, new_game(user_name))
      :ok = Agent.update(:games, fn last -> new_games end)
      %{"state" => new_game(user_name), "msg" => user_name <> " joined game.", "type" => "success"}
    end
  end

  # get a list of all game states in Agent
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

  # get a game state 
  def get_state(curr_name) do
    get_all_games |> Map.get(curr_name)
  end

  # update a game state in Agent
  def update_state(state, curr_name) do
    games = get_all_games
    new_games = %{games | curr_name => state}
    :ok = Agent.update(:games, fn last -> new_games end)
    state
  end

  # ticks to next state
  # returns {boolean, new_state}, where boolean indicates it could be a valid move
  def simulate_next_state(curr_name, index) do
    curr_game = get_state(curr_name)
    colors = curr_game.colors
    player = curr_game.turn+1
    case update_colors(colors, player, index) do
      {true, colors} -> {true, curr_game 
                                |> Map.put(:colors, colors) # update colors
                                |> Map.put(:turn, 1 - curr_game.turn) # update turn
                                |> check_win
                                |> update_state(curr_name)}
      _ -> {false, curr_game}
    end
  end

  def update_colors(colors, player, index) do
    {:ok, color} = Enum.fetch(colors, index)
    if color > 0 do
      # occupied position
      {false, colors}
    else
      {false, colors} 
        # right
        |> help_update_colors(index, 1, player)
        # down
        |> help_update_colors(index, 8, player)
        # left
        |> help_update_colors(index, -1, player)
        # up
        |> help_update_colors(index, -8, player)
        # up-left
        |> help_update_colors(index, -9, player)
        # up-right
        |> help_update_colors(index, -7, player)
        # down-right
        |> help_update_colors(index, 9, player)
        # down-left
        |> help_update_colors(index, 7, player)
    end
  end

  def help_update_colors(last, index, increment, player) do
    {last_res, last_colors} = last
    if valid_next(last_colors, index, index+increment, player) do
      {curr_res, curr_colors} = check_swaps(last_colors, index, increment, player)
      if curr_res do
        {true, curr_colors |> List.update_at(index, fn _ -> player end)}
      else
        last
      end
    else
      last
    end
  end

  def check_swaps(colors, start, increment, target) do
    next = start + increment
    if !in_bound(start, next) do
      # out of bound
      {false, colors}
    else
      {:ok, next_color} = Enum.fetch(colors, next)
      if next_color == 0 do
        {false, colors}
      else
        if next_color == target do 
          {true, colors}
        else
          {res, new_colors} = check_swaps(colors, next, increment, target)
          if res do
            {true, List.update_at(new_colors, next, fn _ -> target end)}
          else
            {false, colors}
          end
        end
      end
    end
  end

  def check_win(state) do
    # TODO
    state
  end

  def in_bound(curr, next) do
    curr_i = div(curr, 8)
    curr_j = rem(curr, 8)
    next_i = div(next, 8)
    next_j = rem(next, 8)
    res = (next_j - curr_j) * (next_i - curr_i)
    next >= 0 && next < 64 && res >= -1 && res <= 1
  end 

  def valid_next(colors, curr, next, target) do
    if in_bound(curr, next) do
      case Enum.fetch(colors, next) do
        {:ok, elem} ->
          elem != 0 && elem != target
        _ -> false
      end
    else
      false
    end
  end 
end