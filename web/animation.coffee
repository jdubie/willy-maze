WIDTH = 500
TRANSITION = 10

exports.animateStates = (states, board, dim) ->
  canvas = new Canvas(WIDTH, dim, board)
  canvas.render()

  drawOne = ->
    state = states.shift()
    canvas.draw(state)
    setTimeout(drawOne, TRANSITION) if states.length > 0

  drawOne()

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

  render: ->
    for x in [0..@DIM]
      for y in [0..@DIM]
        if not @matrix._open(x,y)
          @ctx.fillRect @CELL*x, @CELL*y, @CELL, @CELL

  draw: (state) ->
    @erase()
    @render()
    @drawPlayer(state.ter, "00FF00")
    @drawPlayer(state.pos, "FF0000")
