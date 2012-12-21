PriorityQueue = require('./priority_queue')

module.exports = (start, board) ->

  h = (state) -> 0

  reconstruct_path = (s) ->
    if came_from[s.id()]
      p = reconstruct_path(came_from[s.id()])
      p.push(s)
      return p
    else
      return [s]

  explored = {}
  frontier = PriorityQueue()
  frontier.push(start, h(start))
  came_from = {}

  while true
    return null if frontier.size() is 0
    {object, priority} = frontier._pop()
    s = object
    return reconstruct_path(s) if s.isTerminal()
    explored[s.id()] = true
    for a in s.actions(board)
      t = s.suc(a)
      continue if t.id() in Object.keys(explored)
      came_from[t.id()] = s
      frontier.push(t, priority + 1 + h(s) - h(t))
