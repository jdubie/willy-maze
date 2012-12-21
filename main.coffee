optimist = require 'optimist'
Position = require './state_space/position'
State    = require './state_space/state'
Board    = require './state_space/board'
A_Star = require './algs/a_star'
DFS    = require './algs/dfs'
BFS    = require './algs/bfs'
Random = require './algs/random'

argv = optimist
  .usage('Maze finder\ncoffee main -d 30 -a AStar')
  .describe('a','search algorithm')
  .default('a', 'A_Star')
  .alias('d', 'dimensions')
  .describe('d', 'dimension of square maze')
  .default('d', 30)
  .argv

randomMaze = (x, y) ->
  Math.round(Math.random() * 4) isnt 4

board = new Board(randomMaze, argv.d)
start = new State(board.randomPosition(), board.randomPosition())

algorithm = {A_Star, DFS, BFS, Random}[argv.a]

path = algorithm(start, board)

#### PRINT PATH #####
console.log 'Path:', (path.map (elem) -> elem.pos)
