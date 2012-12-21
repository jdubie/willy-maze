Action =
  UP:     [ 0 ,-1 ]
  DOWN:   [ 0 , 1 ]
  RIGHT:  [ 1 , 0 ]
  LEFT:   [ -1, 0 ]

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
