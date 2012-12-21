Position = require './position'

module.exports = class Board
  constructor: (matrix, @dim) ->
    @mat = []
    for i in [0..@dim]
      @mat[i] = []
      for j in [0..@dim]
        @mat[i][j] = matrix(i,j)

  valid: (p) ->
    @_onBoard(p.x, p.y) and @_open(p.x, p.y)

  _open: (x,y) ->
    @mat[x]?[y]

  _onBoard: (x,y) ->
    y >= 0 and y < @dim and x >= 0 and x < @dim

  random: ->
    Math.floor(Math.random() * @dim)

  randomPosition: ->
    new Position(@random(), @random())
