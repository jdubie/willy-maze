DIM = 5
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
    @_onBoard(p.x, p.y) and @_open(p.x, p.y)

  _open: (x,y) -> @mat[x]?[y]

  _onBoard: (x,y) -> y >= 0 and y < DIM and x >= 0 and x < DIM

  #matrix = (x,y) -> Math.round(Math.random() * 2) isnt 2
matrix = (x,y) -> true
BOARD = new Board(matrix)

class State
  constructor: (@pos, @ter) ->
  suc: (a) -> new State(@pos.move(a), @ter)
  actions: -> (a for key, a of Action when @pos.canMove(a))
  isTerminal: -> @pos.equal(@ter)
  id: -> @pos.toString()

class Position
  constructor: (@x,@y) ->
  equal: (p) -> p.x is @x and p.y is @y
  move: (a) -> new Position(@x + a[0], @y + a[1])
  canMove: (a) -> BOARD.valid(@move(a))
  toString: -> "#{@x},#{@y}"

###
  Main
###
#canvas = new Canvas(500, 20, matrix)
#canvas.render()
#####


class Random
  constructor: (@state) ->
  run: ->
    count = 0
    while not @state.isTerminal()
      actions = @state.actions()
      if actions.length is 0
        console.log 'Stuck'
        return
      a = actions[Math.floor(Math.random() * actions.length)]
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

explored = {}
dfs = (path, s) ->
  return path if s.isTerminal()
  for a in s.actions()
    t = s.suc(a)
    continue if (t.id() in Object.keys(explored))
    explored[t.id()] = true
    _path = dfs(new Array(path..., a), t)
    return _path if _path != null
  return null

startState = new State(new Position(0, 0), new Position(0, DIM - 1))
#a = new Random(startState)
p = dfs([], startState)
console.log p

#a = new UCS(startState)


