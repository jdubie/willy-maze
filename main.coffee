optimist = require('optimist')
maze = {init, State, Position} = require './maze'

argv = optimist
  .usage('Maze finder\ncoffee main -d 30 -a AStar')
  .describe('a','search algorithm')
  .default('a', 'A_Star')
  .alias('d', 'dimensions')
  .describe('d', 'dimension of square maze')
  .default('d', 30)
  .argv

Math.seedrandom('time-testing')
matrix = (x,y) -> Math.round(Math.random() * 4) isnt 4
init(argv.d, matrix)

start = new State(new Position(0,0), new Position(argv.d - 1, argv.d - 1))

console.log 'Path:', maze[argv.a](start).map (elem) -> elem.pos
