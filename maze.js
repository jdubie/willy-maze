(function() {
  var Action, Board, Position, PriorityQueue, State, pathToStates,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  PriorityQueue = require('./priority_queue');

  require('./seedrandom');

  pathToStates = function(state, path) {
    var action, nextState, states, _i, _len;
    states = [state];
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      action = path[_i];
      nextState = state.suc(action);
      states.push(nextState);
      state = nextState;
    }
    return animateStates(states);
  };

  Action = {
    UP: [0, -1],
    DOWN: [0, 1],
    RIGHT: [1, 0],
    LEFT: [-1, 0]
  };

  Board = (function() {

    function Board(matrix, dim) {
      var i, j, _ref, _ref2;
      this.dim = dim;
      this.mat = [];
      for (i = 0, _ref = this.dim; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.mat[i] = [];
        for (j = 0, _ref2 = this.dim; 0 <= _ref2 ? j <= _ref2 : j >= _ref2; 0 <= _ref2 ? j++ : j--) {
          this.mat[i][j] = matrix(i, j);
        }
      }
    }

    Board.prototype.valid = function(p) {
      return this._onBoard(p.x, p.y) && this._open(p.x, p.y);
    };

    Board.prototype._open = function(x, y) {
      var _ref;
      return (_ref = this.mat[x]) != null ? _ref[y] : void 0;
    };

    Board.prototype._onBoard = function(x, y) {
      return y >= 0 && y < this.dim && x >= 0 && x < this.dim;
    };

    State;

    return Board;

  })();

  exports.State = State = (function() {

    function State(pos, ter) {
      this.pos = pos;
      this.ter = ter;
    }

    State.prototype.suc = function(a) {
      return new State(this.pos.move(a), this.ter);
    };

    State.prototype.actions = function() {
      var a, key, _results;
      _results = [];
      for (key in Action) {
        a = Action[key];
        if (this.pos.canMove(a)) _results.push(a);
      }
      return _results;
    };

    State.prototype.isTerminal = function() {
      return this.pos.equal(this.ter);
    };

    State.prototype.id = function() {
      return this.pos.toString();
    };

    return State;

  })();

  exports.Position = Position = (function() {

    function Position(x, y) {
      this.x = x;
      this.y = y;
    }

    Position.prototype.equal = function(p) {
      return p.x === this.x && p.y === this.y;
    };

    Position.prototype.move = function(a) {
      return new Position(this.x + a[0], this.y + a[1]);
    };

    Position.prototype.canMove = function(a) {
      return board.valid(this.move(a));
    };

    Position.prototype.toString = function() {
      return "" + this.x + "," + this.y;
    };

    Position.random = function() {
      return new Position(Math.floor(Math.random() * DIM), Math.floor(Math.random() * DIM));
    };

    return Position;

  })();

  exports.Random = function(state) {
    var a, actions, states;
    states = [state];
    while (!state.isTerminal()) {
      actions = state.actions();
      if (actions.length === 0) {
        console.log('Stuck');
        return null;
      }
      a = actions[Math.floor(Math.random() * actions.length)];
      state = state.suc(a);
      states.push(state);
    }
    return states;
  };

  exports.DFS = function(start) {
    var dfs, explored;
    explored = {};
    dfs = function(path, s) {
      var a, t, _i, _len, _path, _ref, _ref2;
      if (s.isTerminal()) return path;
      _ref = s.actions();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        t = s.suc(a);
        if ((_ref2 = t.id(), __indexOf.call(Object.keys(explored), _ref2) >= 0)) {
          continue;
        }
        explored[t.id()] = true;
        _path = dfs((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return typeof result === "object" ? result : child;
        })(Array, __slice.call(path).concat([a]), function() {}), t);
        if (_path !== null) return _path;
      }
      return null;
    };
    return pathToStates(start, dfs([], start));
  };

  exports.A_Star = function(start) {
    var a, came_from, explored, frontier, h, object, priority, reconstruct_path, s, t, _i, _len, _ref, _ref2, _ref3;
    h = function(state) {
      return Math.abs(state.ter.x - state.pos.x) + Math.abs(state.ter.y - state.pos.y);
    };
    explored = {};
    frontier = PriorityQueue();
    frontier.push(start, h(start));
    came_from = {};
    reconstruct_path = function(s) {
      var p;
      if (came_from[s.id()]) {
        p = reconstruct_path(came_from[s.id()]);
        p.push(s);
        return p;
      } else {
        return [s];
      }
    };
    while (true) {
      if (frontier.size() === 0) return null;
      _ref = frontier._pop(), object = _ref.object, priority = _ref.priority;
      s = object;
      if (s.isTerminal()) return reconstruct_path(s);
      explored[s.id()] = true;
      _ref2 = s.actions();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        a = _ref2[_i];
        t = s.suc(a);
        if (_ref3 = t.id(), __indexOf.call(Object.keys(explored), _ref3) >= 0) {
          continue;
        }
        came_from[t.id()] = s;
        frontier.push(t, priority + 1 + h(s) - h(t));
      }
    }
  };

}).call(this);
