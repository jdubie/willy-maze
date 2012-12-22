Position  = require '../state_space/position'
Board     = require '../state_space/board'
State     = require '../state_space/state'
A_Star    = require '../algs/a_star'
DFS       = require '../algs/dfs'
BFS       = require '../algs/bfs'
Random    = require '../algs/random'
Canvas    = require '../web/canvas'
prim      = require '../maze/prim'
random    = require '../maze/random'

getDim = ->
  e = window.document.getElementById('dim')
  parseInt(e.value)

getTransition = ->
  e = window.document.getElementById('transition')
  parseInt(e.value)

getAlgorithm = ->
  e = document.getElementById('algorithm')
  {DFS, BFS, Random, A_Star}[e.value]

$('form').submit (e) ->
  e.preventDefault()

  # get parameters
  algorithm  = getAlgorithm()
  dim        = getDim()
  transition = getTransition()

  # generate maze
  #maze = prim(getDim())
  maze = random

  # create state space
  board = new Board(maze, dim)
  start = new State(board.randomPosition(), board.randomPosition())
  canvas = new Canvas(board, dim, 500, transition)

  # run algorithm
  path = algorithm(start, board)
  canvas.animate(path)
