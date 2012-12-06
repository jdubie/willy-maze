(function() {
  var Action, Algorithm, BOARD, BaseLine, Board, Canvas, DFS, DIM, Position, State, WIDTH, a, matrix, startState,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  DIM = 20;

  WIDTH = 500;

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
            if (!this.matrix(x, y)) {
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
      this.drawPlayer(state.pos, "FF0000");
      return this.drawPlayer(state.ter, "00FF00");
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
      return this._onBoard(p.x, p.y) && this._open(p.y, p.x);
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
    return Math.round(Math.random() * 2) !== 2;
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

    return Position;

  })();

  /*
    Main
  */

  Algorithm = (function() {

    function Algorithm(state) {
      this.state = state;
    }

    Algorithm.prototype.run = function() {
      var a, count;
      count = 0;
      while (!this.state.isTerminal()) {
        a = this.getAction(this.state.actions());
        this.state = this.state.suc(a);
        count++;
      }
      return console.log('DONE', count);
    };

    return Algorithm;

  })();

  BaseLine = (function(_super) {

    __extends(BaseLine, _super);

    function BaseLine() {
      BaseLine.__super__.constructor.apply(this, arguments);
    }

    BaseLine.prototype.getAction = function(actions) {
      if (actions.length === 0) console.error('No actions');
      return actions[Math.floor(Math.random() * actions.length)];
    };

    return BaseLine;

  })(Algorithm);

  DFS = (function(_super) {

    __extends(DFS, _super);

    function DFS() {
      DFS.__super__.constructor.apply(this, arguments);
    }

    DFS.prototype.getAction = function(actions) {};

    return DFS;

  })(Algorithm);

  startState = new State(new Position(0, 0), new Position(0, DIM - 1));

  a = new BaseLine(startState);

  a.run();

}).call(this);
