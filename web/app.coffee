Position  = require '../state_space/position'
Board     = require '../state_space/board'
State     = require '../state_space/state'
animation = require './animation'

dim = 200

# TODO make a cool maze
matrix = (x,y) -> Math.round(Math.random() * 4) isnt 4
board = new Board(matrix, dim)
init(board)
animation.init(board)

start = new State(Position.random(), Position.random())
path = maze.A_Star(start)

animation.animateStates(path)
