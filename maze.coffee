PriorityQueue = require('./priority_queue')
require('./seedrandom') # modifies Math global

#
# DFS and A* implementations from
# http://www.stanford.edu/class/cs221/lectures/search.pdf
#

# helper
pathToStates = (state, path) ->
  states = [state]
  for action in path
    nextState = state.suc(action)
    states.push nextState
    state = nextState
  animateStates(states)

Action =
  UP:     [ 0 ,-1 ]
  DOWN:   [ 0 , 1 ]
  RIGHT:  [ 1 , 0 ]
  LEFT:   [ -1, 0 ]

class Board
  constructor: (matrix, @dim) ->
    @mat = []
    for i in [0..@dim]
      @mat[i] = []
      for j in [0..@dim]
        @mat[i][j] = matrix(i,j)

  valid: (p) ->
    @_onBoard(p.x, p.y) and @_open(p.x, p.y)

  _open: (x,y) -> @mat[x]?[y]

  _onBoard: (x,y) -> y >= 0 and y < @dim and x >= 0 and x < @dim

  State

exports.State = class State
  constructor: (@pos, @ter) ->
  suc: (a) -> new State(@pos.move(a), @ter)
  actions: -> (a for key, a of Action when @pos.canMove(a))
  isTerminal: -> @pos.equal(@ter)
  id: -> @pos.toString()

exports.Position = class Position
  constructor: (@x,@y) ->
  equal: (p) -> p.x is @x and p.y is @y
  move: (a) -> new Position(@x + a[0], @y + a[1])
  canMove: (a) -> board.valid(@move(a))
  toString: -> "#{@x},#{@y}"
  @random: -> new Position(Math.floor(Math.random()*DIM),Math.floor(Math.random()*DIM))


exports.Random = (state) ->

  states = [state]

  while not state.isTerminal()
    actions = state.actions()
    if actions.length is 0
      console.log 'Stuck'
      return null
    a = actions[Math.floor(Math.random() * actions.length)]
    state = state.suc(a)
    states.push(state)

  states

exports.DFS = (start) ->

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
  
  pathToStates(start, dfs([], start))
  

exports.A_Star = (start) ->

  h = (state) ->
    Math.abs(state.ter.x - state.pos.x) + Math.abs(state.ter.y - state.pos.y)

  explored = {}
  frontier = PriorityQueue()
  frontier.push(start, h(start))
  came_from = {}

  reconstruct_path = (s) ->
    if came_from[s.id()]
      p = reconstruct_path(came_from[s.id()])
      p.push(s)
      return p
    else
      return [s]

  while true
    return null if frontier.size() is 0
    {object, priority} = frontier._pop()
    s = object
    return reconstruct_path(s) if s.isTerminal()
    #return s if s.isTerminal()
    explored[s.id()] = true
    for a in s.actions()
      t = s.suc(a)
      continue if t.id() in Object.keys(explored)
      came_from[t.id()] = s
      frontier.push(t, priority + 1 + h(s) - h(t))
