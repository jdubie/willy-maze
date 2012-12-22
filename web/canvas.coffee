WIDTH = 500
TRANSITION = 10

module.exports = class Canvas
  constructor: (@matrix, @DIM = 50, @WIDTH = 500, @TRANSITION = 50) ->
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

  animate: (states) ->
    
    drawOne = =>
      state = states.shift()
      @draw(state)
      setTimeout(drawOne, @TRANSITION) if states.length > 0

    drawOne()
