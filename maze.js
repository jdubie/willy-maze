(function() {
  var Action, BOARD, Board, Canvas, DIM, Position, Random, State, WIDTH, animate, dfs, explored, matrix, path, startState,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  DIM = 20;

  WIDTH = 500;

  animate = function(state, path) {
    var canvas, drawOne;
    canvas = new Canvas(500, 20, BOARD);
    canvas.render();
    canvas.draw(state);
    drawOne = function() {
      var a;
      a = path.shift();
      state = state.suc(a);
      canvas.draw(state);
      if (path.length > 0) return setTimeout(drawOne);
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

  startState = new State(new Position(0, 0), new Position(DIM - 1, DIM - 1));

  path = dfs([], startState);

  if (path) animate(startState, path);

}).call(this);
