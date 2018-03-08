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
          curr_game
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
          curr_game
        end
      else
        # two players in room
        if Enum.member? curr_game.players, user_name do
          # already a player
          curr_game
        else
          # speculator
          curr_game = %{curr_game | speculators: curr_game.speculators ++ [user_name]}
          new_games = %{games | curr_name => curr_game}
          :ok = Agent.update(:games, fn last -> new_games end)
          curr_game
        end
      end
    else
      new_games = Map.put(games, curr_name, new_game(user_name))
      :ok = Agent.update(:games, fn last -> new_games end)
      new_game(user_name)
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
    curr_game = get_state curr_name
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
    # right
    if valid_next(colors, index+1, player) do
      case check_swaps(colors, index, 1, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # down
    if valid_next(colors, index+8, player) do
      case check_swaps(colors, index, 8, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # left
    if valid_next(colors, index-1, player) do
      case check_swaps(colors, index, -1, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # up
    if valid_next(colors, index-8, player) do
      case check_swaps(colors, index, -8, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # up-left
    if valid_next(colors, index-9, player) do
      case check_swaps(colors, index, -9, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # up-right
    if valid_next(colors, index-7, player) do
      case check_swaps(colors, index, -7, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
     # down-right
    if valid_next(colors, index+9, player) do
      case check_swaps(colors, index, 9, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end
    # down-left
    if valid_next(colors, index+7, player) do
      case check_swaps(colors, index, 7, player) do
        {true, colors} -> {true, colors |> List.update_at(index, fn _ -> player end)}
        _ ->  {false, colors}
      end
    end


  end

  def check_swaps(colors, start, increment, target) do
    next = start + increment
    if next >= 64 || next < 0 do
      # out of bound
      {false, colors}
    else
      {:ok, next_color} = List.get(colors, next)
      case next_color do
        0 ->
          {false, colors}
        target ->
          {true, colors}
        _ ->
          case check_swaps(colors, next, increment, target) do
            {true, colors} ->
              {true, colors |> List.update_at(next, fn _ -> target end)}
            _ ->
              {false, colors}
          end
      end
    end
  end

  def check_win(state) do
    # TODO
    state
  end

  def valid_next(colors, next, target) do
    case List.get(colors, next) do
      {:ok, elem} ->
        case elem do
          0 -> false
          _ -> (elem != target)
        end
      _ -> false
    end
  end 

end