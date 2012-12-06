DIM = 20
WIDTH = 500

class Canvas
  constructor: (@WIDTH, @DIM, @matrix) ->
    #return unless window?
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

  render: ->
    #return unless window
    for x in [0..@DIM]
      for y in [0..@DIM]
        if not @matrix(x,y)
          @ctx.fillRect @CELL*x, @CELL*y, @CELL, @CELL

  draw: (state) ->
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
    @_onBoard(p.x, p.y) and @_open(p.y, p.x)

  _open: (x,y) -> @mat[x]?[y]

  _onBoard: (x,y) -> y >= 0 and y < DIM and x >= 0 and x < DIM

matrix = (x,y) -> Math.round(Math.random() * 2) isnt 2
#matrix = (x,y) -> true
BOARD = new Board(matrix)

class State
  constructor: (@pos, @ter) ->
  suc: (a) -> new State(@pos.move(a), @ter)
  actions: -> (a for key, a of Action when @pos.canMove(a))
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
#canvas.render()
#####


class Algorithm
  constructor: (@state) ->
  run: ->
    count = 0
    while not @state.isTerminal()
      a = @getAction(@state.actions())
      @state = @state.suc(a)
      count++
    console.log 'DONE', count

      #a = @getAction(@state.actions())
      #@state = @state.suc(a)
      #canvas.draw(@state)
      #foo = => @run() # closure
      #unless @state.isTerminal()
      #  setTimeout(foo, 1)
      #else
      #  console.log 'DONE'

class BaseLine extends Algorithm
  getAction: (actions) ->
    console.error('No actions') if actions.length is 0
    actions[Math.floor(Math.random() * actions.length)]

class DFS extends Algorithm
  getAction: (actions) ->

startState = new State(new Position(0, 0), new Position(0, DIM - 1))
a = new BaseLine(startState)
#a = new DFS(startState)
#a = new UCS(startState)

a.run()

