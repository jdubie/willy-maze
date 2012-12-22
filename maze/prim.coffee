############################################################
## maze/prim.coffee
## implements randomized Prim's algorithm
## http://en.wikipedia.org/wiki/Maze_generation_algorithm
############################################################

module.exports = (dim) ->
  
  # Start with a grid full of walls.
  m = new Matrix(dim)

  # Pick a cell, mark it as part of the maze. Add the walls of the cell to
  # the wall list.
  m.set(0, 0, true)
  walls = m.wall(0, 0)

  prim(m, walls)

  return m

prim = (matrix, walls) ->
  return if walls.length is 0
  # While there are walls in the list:

  # 1. Pick a random wall from the list. If the cell on the opposite side isn't in the maze yet:
     
  #   a. Make the wall a passage and mark the cell on the opposite side as part of the maze.
  #   b. Add the neighboring walls of the cell to the wall list.
  # 2. If the cell on the opposite side already was in the maze, remove the wall from the list.

  #matrix
   

class Matrix
  constructor: (@dim) ->
    @_d = []
    for i in [0...dim]
      @_d[i] = []
      for j in [0...dim]
        @_d[i][j] = false

  walls: (x, y) ->
    result = []
    adjacent = [-1, 0, 1]
    for i in adjacent
      for j in adjacent
        result.push([i,j]) if @valid(i,j)
    return result

  valid: (x, y) ->
    (0 <= x and x < @dim) and (0 <= y and y < @dim)

  get: (x, y) ->
    @_d[x][y]

  set: (x, y, value) ->
    @_d[x][y] = value

