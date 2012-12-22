##################################################
## position.coffee
##################################################

module.exports = class Position
  constructor: (@x,@y) ->

  equal: (p) ->
    p.x is @x and p.y is @y

  move: (a) ->
    new Position(@x + a[0], @y + a[1])

  canMove: (a, board) ->
    board.valid(@move(a))

  toString: ->
    "#{@x},#{@y}"
