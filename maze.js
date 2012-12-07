(function() {
  var Action, BOARD, Board, Canvas, DIM, Position, Random, State, WIDTH, animate, animateStates, foo, initState, matrix, path, states,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  DIM = 200;

  WIDTH = 500;

  animateStates = function(states) {
    var canvas, drawOne;
    canvas = new Canvas(WIDTH, DIM, BOARD);
    canvas.render();
    drawOne = function() {
      var state;
      state = states.shift();
      canvas.draw(state);
      if (states.length > 0) return setTimeout(drawOne, 50);
    };
    return drawOne();
  };

  animate = function(state, path) {
    var canvas, drawOne;
    canvas = new Canvas(WIDTH, DIM, BOARD);
    canvas.render();
    canvas.draw(state);
    drawOne = function() {
      var a;
      a = path.shift();
      state = state.suc(a);
      canvas.draw(state);
      if (path.length > 0) return setTimeout(drawOne, 100);
    };
    return drawOne();
  };

  Canvas = (function() {

    function Canvas(WIDTH, DIM, matrix) {
      var c;
      this.WIDTH = WIDTH;
      this.DIM = DIM;
      this.matrix = matrix;
      this.CELL = this.WIDTH / this.DIM;
      c = window.document.getElementById("myCanvas");
      this.ctx = c.getContext("2d");
      this.ctx.fillStyle = "#008855";
    }

    Canvas.prototype.erase = function() {
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillRect(0, 0, this.WIDTH, this.WIDTH);
      return this.ctx.fillStyle = "#008855";
    };

    Canvas.prototype.drawPlayer = function(_arg, color) {
      var x, y;
      x = _arg.x, y = _arg.y;
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(this.CELL * x, this.CELL * y, this.CELL, this.CELL);
    };

    Canvas.prototype.render = function() {
      var x, y, _ref, _results;
      _results = [];
      for (x = 0, _ref = this.DIM; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (y = 0, _ref2 = this.DIM; 0 <= _ref2 ? y <= _ref2 : y >= _ref2; 0 <= _ref2 ? y++ : y--) {
            if (!this.matrix._open(x, y)) {
              _results2.push(this.ctx.fillRect(this.CELL * x, this.CELL * y, this.CELL, this.CELL));
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Canvas.prototype.draw = function(state) {
      this.erase();
      this.render();
      this.drawPlayer(state.ter, "00FF00");
      return this.drawPlayer(state.pos, "FF0000");
    };

    return Canvas;

  })();

  Action = {
    UP: [0, -1],
    DOWN: [0, 1],
    RIGHT: [1, 0],
    LEFT: [-1, 0]
  };

  Board = (function() {

    function Board(matrix) {
      var i, j;
      this.mat = [];
      for (i = 0; 0 <= DIM ? i <= DIM : i >= DIM; 0 <= DIM ? i++ : i--) {
        this.mat[i] = [];
        for (j = 0; 0 <= DIM ? j <= DIM : j >= DIM; 0 <= DIM ? j++ : j--) {
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
      return y >= 0 && y < DIM && x >= 0 && x < DIM;
    };

    return Board;

  })();

  matrix = function(x, y) {
    return Math.round(Math.random() * 10) !== 10;
  };

  BOARD = new Board(matrix);

  State = (function() {

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

  Position = (function() {

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
      return BOARD.valid(this.move(a));
    };

    Position.prototype.toString = function() {
      return "" + this.x + "," + this.y;
    };

    Position.random = function() {
      return new Position(Math.floor(Math.random() * DIM), Math.floor(Math.random() * DIM));
    };

    return Position;

  })();

  Random = (function() {

    function Random(state) {
      this.state = state;
    }

    Random.prototype.run = function() {
      var a, actions, count;
      count = 0;
      while (!this.state.isTerminal()) {
        actions = this.state.actions();
        if (actions.length === 0) {
          console.log('Stuck');
          return;
        }
        a = actions[Math.floor(Math.random() * actions.length)];
        this.state = this.state.suc(a);
        count++;
      }
      return console.log('DONE', count);
    };

    return Random;

  })();

  initState = new State(Position.random(), Position.random());

  path = [];

  foo = function() {
    var a, came_from, explored, frontier, h, object, priority, reconstruct_path, s, t, _i, _len, _ref, _ref2, _ref3;
    h = function(state) {
      return Math.abs(state.ter.x - state.pos.x) + Math.abs(state.ter.y - state.pos.y);
    };
    explored = {};
    frontier = PriorityQueue();
    frontier.push(initState, h(initState));
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

  states = foo();

  if (states) animateStates(states);

}).call(this);
