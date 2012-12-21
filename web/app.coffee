Position  = require '../state_space/position'
Board     = require '../state_space/board'
State     = require '../state_space/state'
A_Star    = require '../algs/a_star'
DFS       = require '../algs/dfs'
BFS       = require '../algs/bfs'
Random    = require '../algs/random'
animation = require './animation'

dim = 50

# TODO make a cool maze
randomMaze = (x, y) ->
  Math.round(Math.random() * 4) isnt 4
board = new Board(randomMaze, dim)
start = new State(board.randomPosition(), board.randomPosition())

algorithms = {DFS, BFS, Random, A_Star}
window.run = (algorithm) ->
  path = algorithm(start, board)
  animation.animateStates(path, board, dim)
