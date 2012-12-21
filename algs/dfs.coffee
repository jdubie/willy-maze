# helper
pathToStates = (state, path) ->
  states = [state]
  for action in path
    nextState = state.suc(action)
    states.push nextState
    state = nextState
  states

module.exports = (start, board) ->
  explored = {}
  dfs = (path, s) ->
    return path if s.isTerminal()
    for a in s.actions(board)
      t = s.suc(a)
      continue if (t.id() in Object.keys(explored))
      explored[t.id()] = true
      _path = dfs(new Array(path..., a), t)
      return _path if _path != null
    return null
  pathToStates(start, dfs([], start))
