##################################################
## state.coffee
##################################################


Action = require './action'

module.exports = class State
  constructor: (@pos, @ter) ->

  suc: (a) ->
    new State(@pos.move(a), @ter)

  actions: (board) ->
    (a for key, a of Action when @pos.canMove(a, board))

  isTerminal: ->
    @pos.equal(@ter)

  id: ->
    @pos.toString()
