##################################################
## random.coffee
## Random walk search
##################################################

module.exports = (state, board) ->
  states = [state]
  while not state.isTerminal()
    actions = state.actions(board)
    if actions.length is 0
      return null
    a = actions[Math.floor(Math.random() * actions.length)]
    state = state.suc(a)
    states.push(state)
  states
