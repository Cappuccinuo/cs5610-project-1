defmodule Othello.Game do
  use Agent

  # helper function to generate a new state with input user name as first player
  def new_game(user_name) do
    colors = for _ <- 1..64, do: 0
    %{colors: colors, turn: 0, players: [user_name], winner: nil, speculators: [], online_players: 1}
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
          curr_game = %{curr_game | players: curr_game.players ++ [user_name], online_players: 2}
          colors = curr_game.colors 
                    |> List.update_at(27, fn _ -> 2 end)
                    |> List.update_at(28, fn _ -> 1 end)
                    |> List.update_at(35, fn _ -> 1 end)
                    |> List.update_at(36, fn _ -> 2 end)
          curr_game = %{curr_game | colors: colors}
          new_games = %{games | curr_name => curr_game}
          :ok = Agent.update(:games, fn last -> new_games end)
          %{"state" => curr_game, "msg" => user_name <> " joined game.", "type" => "success"}
        end
      else
        # two players in room
        if Enum.member? curr_game.players, user_name do
          # already a player
          curr_game = %{curr_game | online_players: 2}
          new_games = %{games | curr_name => curr_game}
          :ok = Agent.update(:games, fn last -> new_games end)
          %{"state" => curr_game, "msg" => user_name <> " is back.", "type" => "success"}
        else
          # speculator
          if String.length(user_name) > 0 do
            if Enum.member? curr_game.speculators, user_name do
              %{"state" => curr_game, "msg" => user_name <> " is watching.", "type" => "info"}
            else
              curr_game = %{curr_game | speculators: curr_game.speculators ++ [user_name]} 
              new_games = %{games | curr_name => curr_game}
              :ok = Agent.update(:games, fn last -> new_games end)
              %{"state" => curr_game, "msg" => user_name <> " is watching.", "type" => "info"}
            end
          else
            %{"state" => curr_game, "msg" => "Anonymous is watching.", "type" => "info"}
          end 
        end
      end
    else
      # first player
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

  def restart_game(curr_name) do
    game = get_state curr_name
    next_game = new_game ""
    next_game = %{next_game | players: game.players, speculators: game.speculators, online_players: game.online_players}
    next_game = %{next_game | colors: next_game.colors 
                                        |> List.update_at(27, fn _ -> 2 end)
                                        |> List.update_at(28, fn _ -> 1 end)
                                        |> List.update_at(35, fn _ -> 1 end)
                                        |> List.update_at(36, fn _ -> 2 end)}
    update_state %{"state" => next_game}, curr_name  
  end

  # update a game state in Agent
  def update_state(resp, curr_name) do
    games = get_all_games
    new_games = %{games | curr_name => resp["state"]}
    :ok = Agent.update(:games, fn last -> new_games end)
    resp
  end

  def delete_state(curr_name) do
    games = get_all_games
    new_games = Map.delete games, curr_name
    Agent.update(:games, fn last -> new_games end)
  end

  # ticks to next state
  # returns {boolean, new_state}, where boolean indicates it could be a valid move
  def simulate_next_state(curr_name, index) do
    curr_game = get_state(curr_name)
    colors = curr_game.colors
    player = curr_game.turn+1
    resp = %{"state" => curr_game}
    case update_colors(colors, player, index) do
      {true, curr_colors} -> {true, resp 
                                |> check_turn_and_win(curr_colors)
                                |> update_state(curr_name)}
      _ -> {false, resp}
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

  def check_turn_and_win(resp, colors) do
    # TODO
    game = resp["state"]
    player = 1 - game.turn
    curr_game = %{game | colors: colors}
    pre_winner = winner colors
    if pre_winner >= 0 do
      # has a winner
      %{resp | "state" => %{curr_game | winner: pre_winner}}
    else
      # no winner
      if has_next_move(colors, player+1, 0) do
        # next player can move
        %{resp | "state" => %{curr_game | turn: player}}
      else
       # next player cannot move
        if !has_next_move(colors, game.turn+1, 0) do
          # current player cannot move, too
          {zeroes, ones, twos} = get_num_colors({0, 0, 0}, colors, 0)
          if ones > twos do
            %{resp | "state" => %{curr_game | winner: 0}} # player 0 wins
          else
            if ones < twos do
              %{resp | "state" => %{curr_game | winner: 1}} # player 1 wins
            else
              %{resp | "state" => %{curr_game | winner: 2}} # ties
            end
          end
        else
          # current player can move
          {:ok, player_name} = Enum.fetch(game.players, game.turn)
          resp = %{resp | "state" => curr_game}
          Map.update(resp, "msg", "Opponent cannot move, still " <> player_name <> "'s turn", &(&1))
        end
      end
    end
  end

  def winner(colors) do
    {zeroes, ones, twos} = get_num_colors({0, 0, 0}, colors, 0)
    if zeroes == 0 do
      if ones > twos do
        0 # player 0 wins
      else
        if ones < twos do
          1 # player 1 wins
        else
          2 # ties
        end
      end
    else
      -1
    end
  end

  def get_num_colors(counts, colors, index) do
    if index >= 64 do
      counts
    else
      {zeroes, ones, twos} = counts
      {:ok, color} = Enum.fetch(colors, index)
      if color == 0 do
          get_num_colors({zeroes+1, ones, twos}, colors, index+1)
      else
        if color == 1 do
          get_num_colors({zeroes, ones+1, twos}, colors, index+1)
        else
          get_num_colors({zeroes, ones, twos+1}, colors, index+1)
        end
      end
    end
  end

  def has_next_move(colors, player, index) do
    if index >= 64 do
      false
    else
      {next_move_found, new_colors} = update_colors(colors, player, index)
      next_move_found || has_next_move(colors, player, index+1)
    end
  end

  def in_bound(curr, next) do
    curr_i = div(curr, 8)
    curr_j = rem(curr, 8)
    next_i = div(next, 8)
    next_j = rem(next, 8)
    diff_j = (next_j - curr_j)
    diff_i = (next_i - curr_i)
    next >= 0 && next < 64 && diff_j >= -1 && diff_j <= 1 && diff_i >= -1 && diff_i <= 1
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

  def user_leave(curr_name, user_name) do
    game = get_state curr_name
    if game && Enum.member? game.players, user_name do
      game = %{game | online_players: game.online_players - 1} 
      if game.online_players > 0 do
        # there is remaining online player
        resp = update_state(%{"state" => game}, curr_name)
        %{"state" => resp["state"], "msg" => user_name <> " (player) leaves.", "type" => "warning", "label" => "user:leave"}
      else
        # no online player, close and delete game table
        :ok = delete_state curr_name
        %{"msg" => user_name <> " (last player) has left. Table closed", "type" => "warning", "label" => "table:close"}
      end
    else
      if game && Enum.member? game.speculators, user_name do
        game = %{game | speculators: List.delete(game.speculators, user_name)}
        resp = update_state(%{"state" => game}, curr_name)
        %{"state" => resp["state"], "msg" => user_name <> " leaves.", "type" => "info", "label" => "user:leave"}
      else
        %{"state" => game, "msg" => "Anonymous leaves.", "type" => "info", "label" => "user:leave"}
      end
    end
  end
end