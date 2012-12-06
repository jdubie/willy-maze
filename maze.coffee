DIM = 20
WIDTH = 500

class Canvas
  constructor: (@WIDTH, @DIM, @matrix) ->
    @CELL = @WIDTH / @DIM
    c = window.document.getElementById("myCanvas")
    @ctx = c.getContext("2d")
    @ctx.fillStyle = "#008855"

  erase: ->
    @ctx.fillStyle = "#FFFFFF"
    @ctx.fillRect 0, 0, @WIDTH, @WIDTH
    @ctx.fillStyle = "#008855"

  drawPlayer: ({x,y}, color) ->
    @ctx.fillStyle = color
    @ctx.fillRect @CELL*x, @CELL*y, @CELL, @CELL

  draw: (state) ->
    @erase()
    for x in [0..@DIM]
      for y in [0..@DIM]
        if @matrix(x,y)
          @ctx.fillRect @CELL*x, @CELL*y, @CELL, @CELL
    
    @drawPlayer(state.pos, "FF0000")
    @drawPlayer(state.ter, "00FF00")


Action =
  UP:     [ 0 ,-1 ]
  DOWN:   [ 0 , 1 ]
  RIGHT:  [ 1 , 0 ]
  LEFT:   [ -1, 0 ]

class Board
  constructor: (matrix) ->
    @mat = []
    for i in [0..DIM]
      @mat[i] = []
      for j in [0..DIM]
        @mat[i][j] = matrix(i,j)

  valid: (p) ->
    console.log 'Board#valid', p
    @_onBoard(p.x, p.y) and @open(p.x, p.y)

  _open: (x,y) -> @mat[x][y]

  _onBoard: (x,y) -> y >= 0 and y < DIM and x >= 0 and x < DIM

#matrix = (x,y) -> Math.round(Math.random())
matrix = (x,y) -> 0
BOARD = new Board(matrix)

class State
  constructor: (@pos, @ter) ->
  suc: (a) -> new State(@pos.move(a), @ter)
  actions: -> (a for a in Action when @pos.canMove(a))
  isTerminal: -> @pos.equal(@ter)

class Position
  constructor: (@x,@y) ->
  equal: (p) -> p.x is @x and p.y is @y
  move: (a) -> new Position(@x + a[0], @y + a[1])
  canMove: (a) -> BOARD.valid(@move(a))

###
  Main
###
#canvas = new Canvas(500, 20, matrix)
#####


class Algorithm
  constructor: (@state) ->
  run: ->
    while not @state.isTerminal()
      a = @getAction(@state.actions())
      @state = @state.suc(a)
      #canvas.draw(@state)
    console.log 'DONE'

class BaseLine extends Algorithm
  getAction: (actions) ->
    console.log actions

startState = new State(new Position(0, 0), new Position(0, DIM - 1))
a = new BaseLine(startState)
a.run()
