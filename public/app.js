(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/state_space/position.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Position;

  module.exports = Position = (function() {

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

    Position.prototype.canMove = function(a, board) {
      return board.valid(this.move(a));
    };

    Position.prototype.toString = function() {
      return "" + this.x + "," + this.y;
    };

    return Position;

  })();

}).call(this);

});

require.define("/state_space/board.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Board, Position;

  Position = require('./position');

  module.exports = Board = (function() {

    function Board(matrix, dim) {
      var i, j, _i, _j, _ref, _ref1;
      this.dim = dim;
      this.mat = [];
      for (i = _i = 0, _ref = this.dim; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.mat[i] = [];
        for (j = _j = 0, _ref1 = this.dim; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          this.mat[i][j] = matrix.get(i, j);
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

    Board.prototype.random = function() {
      return Math.floor(Math.random() * this.dim);
    };

    Board.prototype.randomPosition = function() {
      return new Position(this.random(), this.random());
    };

    return Board;

  })();

}).call(this);

});

require.define("/state_space/state.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Action, State;

  Action = require('./action');

  module.exports = State = (function() {

    function State(pos, ter) {
      this.pos = pos;
      this.ter = ter;
    }

    State.prototype.suc = function(a) {
      return new State(this.pos.move(a), this.ter);
    };

    State.prototype.actions = function(board) {
      var a, key, _results;
      _results = [];
      for (key in Action) {
        a = Action[key];
        if (this.pos.canMove(a, board)) {
          _results.push(a);
        }
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

}).call(this);

});

require.define("/state_space/action.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Action;

  module.exports = Action = {
    UP: [0, -1],
    DOWN: [0, 1],
    RIGHT: [1, 0],
    LEFT: [-1, 0]
  };

}).call(this);

});

require.define("/algs/a_star.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var PriorityQueue, h,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  PriorityQueue = require('./priority_queue');

  module.exports = function(start, board) {
    var a, came_from, explored, frontier, object, priority, reconstruct_path, s, t, _i, _len, _ref, _ref1, _ref2;
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
    explored = {};
    frontier = PriorityQueue();
    frontier.push(start, h(start));
    came_from = {};
    while (true) {
      if (frontier.size() === 0) {
        return null;
      }
      _ref = frontier._pop(), object = _ref.object, priority = _ref.priority;
      s = object;
      if (s.isTerminal()) {
        return reconstruct_path(s);
      }
      explored[s.id()] = true;
      _ref1 = s.actions(board);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        a = _ref1[_i];
        t = s.suc(a);
        if (_ref2 = t.id(), __indexOf.call(Object.keys(explored), _ref2) >= 0) {
          continue;
        }
        came_from[t.id()] = s;
        frontier.push(t, priority + 1 + h(s) - h(t));
      }
    }
  };

  h = function(state) {
    return Math.abs(state.ter.x - state.pos.x) + Math.abs(state.ter.y - state.pos.y);
  };

}).call(this);

});

require.define("/algs/priority_queue.js",function(require,module,exports,__dirname,__filename,process,global){(function() {
  /**
   * @private
   */
  var prioritySortLow = function(a, b) {
    return b.priority - a.priority;
  };

  /**
   * @private
   */
  var prioritySortHigh = function(a, b) {
    return a.priority - b.priority;
  };

  /*global PriorityQueue */
  /**
   * @constructor
   * @class PriorityQueue manages a queue of elements with priorities. Default
   * is highest priority first.
   *
   * @param [options] If low is set to true returns lowest first.
   */
  module.exports = PriorityQueue = function(options) {
  //PriorityQueue = function(options) {
    var contents = [];

    var sorted = false;
    var sortStyle;

    if(options && options.low) {
      sortStyle = prioritySortLow;
    } else {
      sortStyle = prioritySortHigh;
    }

    /**
     * @private
     */
    var sort = function() {
      contents.sort(sortStyle);
      sorted = true;
    };

    var self = {
      /**
       * Removes and returns the next element in the queue.
       * @member PriorityQueue
       * @return The next element in the queue. If the queue is empty returns
       * undefined.
       *
       * @see PrioirtyQueue#top
       */
      pop: function() {
        if(!sorted) {
          sort();
        }

        var element = contents.pop();

        if(element) {
          return element.object;
        } else {
          return undefined;
        }
      },

      _pop: function() {
        if(!sorted) {
          sort();
        }

        var element = contents.pop();

        if(element) {
          return element;
        } else {
          return undefined;
        }
      },

      /**
       * Returns but does not remove the next element in the queue.
       * @member PriorityQueue
       * @return The next element in the queue. If the queue is empty returns
       * undefined.
       *
       * @see PriorityQueue#pop
       */
      top: function() {
        if(!sorted) {
          sort();
        }

        var element = contents[contents.length - 1];

        if(element) {
          return element.object;
        } else {
          return undefined;
        }
      },

      /**
       * @member PriorityQueue
       * @param object The object to check the queue for.
       * @returns true if the object is in the queue, false otherwise.
       */
      includes: function(object) {
        for(var i = contents.length - 1; i >= 0; i--) {
          if(contents[i].object === object) {
            return true;
          }
        }

        return false;
      },

      /**
       * @member PriorityQueue
       * @returns the current number of elements in the queue.
       */
      size: function() {
        return contents.length;
      },

      /**
       * @member PriorityQueue
       * @returns true if the queue is empty, false otherwise.
       */
      empty: function() {
        return contents.length === 0;
      },

      /**
       * @member PriorityQueue
       * @param object The object to be pushed onto the queue.
       * @param priority The priority of the object.
       */
      push: function(object, priority) {
        contents.push({object: object, priority: priority});
        sorted = false;
      }
    };

    return self;
  };
})();

});

require.define("/algs/dfs.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var pathToStates,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  module.exports = function(start, board) {
    var dfs, explored;
    explored = {};
    dfs = function(path, s) {
      var a, t, _i, _len, _path, _ref, _ref1;
      if (s.isTerminal()) {
        return path;
      }
      _ref = s.actions(board);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        t = s.suc(a);
        if ((_ref1 = t.id(), __indexOf.call(Object.keys(explored), _ref1) >= 0)) {
          continue;
        }
        explored[t.id()] = true;
        _path = dfs((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Array, __slice.call(path).concat([a]), function(){}), t);
        if (_path !== null) {
          return _path;
        }
      }
      return null;
    };
    return pathToStates(start, dfs([], start));
  };

  pathToStates = function(state, path) {
    var action, nextState, states, _i, _len;
    states = [state];
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      action = path[_i];
      nextState = state.suc(action);
      states.push(nextState);
      state = nextState;
    }
    return states;
  };

}).call(this);

});

require.define("/algs/bfs.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var PriorityQueue,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  PriorityQueue = require('./priority_queue');

  module.exports = function(start, board) {
    var a, came_from, explored, frontier, h, object, priority, reconstruct_path, s, t, _i, _len, _ref, _ref1, _ref2;
    h = function(state) {
      return 0;
    };
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
    explored = {};
    frontier = PriorityQueue();
    frontier.push(start, h(start));
    came_from = {};
    while (true) {
      if (frontier.size() === 0) {
        return null;
      }
      _ref = frontier._pop(), object = _ref.object, priority = _ref.priority;
      s = object;
      if (s.isTerminal()) {
        return reconstruct_path(s);
      }
      explored[s.id()] = true;
      _ref1 = s.actions(board);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        a = _ref1[_i];
        t = s.suc(a);
        if (_ref2 = t.id(), __indexOf.call(Object.keys(explored), _ref2) >= 0) {
          continue;
        }
        came_from[t.id()] = s;
        frontier.push(t, priority + 1 + h(s) - h(t));
      }
    }
  };

}).call(this);

});

require.define("/algs/random.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {

  module.exports = function(state, board) {
    var a, actions, states;
    states = [state];
    while (!state.isTerminal()) {
      actions = state.actions(board);
      if (actions.length === 0) {
        return null;
      }
      a = actions[Math.floor(Math.random() * actions.length)];
      state = state.suc(a);
      states.push(state);
    }
    return states;
  };

}).call(this);

});

require.define("/web/canvas.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Canvas, TRANSITION, WIDTH;

  WIDTH = 500;

  TRANSITION = 10;

  module.exports = Canvas = (function() {

    function Canvas(matrix, DIM, WIDTH, TRANSITION) {
      var c;
      this.matrix = matrix;
      this.DIM = DIM != null ? DIM : 50;
      this.WIDTH = WIDTH != null ? WIDTH : 500;
      this.TRANSITION = TRANSITION != null ? TRANSITION : 50;
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
      var x, y, _i, _ref, _results;
      _results = [];
      for (x = _i = 0, _ref = this.DIM; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (y = _j = 0, _ref1 = this.DIM; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
            if (!this.matrix._open(x, y)) {
              _results1.push(this.ctx.fillRect(this.CELL * x, this.CELL * y, this.CELL, this.CELL));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
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

    Canvas.prototype.animate = function(states) {
      var drawOne,
        _this = this;
      drawOne = function() {
        var state;
        state = states.shift();
        _this.draw(state);
        if (states.length > 0) {
          return setTimeout(drawOne, _this.TRANSITION);
        }
      };
      return drawOne();
    };

    return Canvas;

  })();

}).call(this);

});

require.define("/maze/prim.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Matrix, prim;

  module.exports = function(dim) {
    var m, walls;
    m = new Matrix(dim);
    m.set(0, 0, true);
    walls = m.wall(0, 0);
    prim(m, walls);
    return m;
  };

  prim = function(matrix, walls) {
    if (walls.length === 0) {

    }
  };

  Matrix = (function() {

    function Matrix(dim) {
      var i, j, _i, _j;
      this.dim = dim;
      this._d = [];
      for (i = _i = 0; 0 <= dim ? _i < dim : _i > dim; i = 0 <= dim ? ++_i : --_i) {
        this._d[i] = [];
        for (j = _j = 0; 0 <= dim ? _j < dim : _j > dim; j = 0 <= dim ? ++_j : --_j) {
          this._d[i][j] = false;
        }
      }
    }

    Matrix.prototype.walls = function(x, y) {
      var adjacent, i, j, result, _i, _j, _len, _len1;
      result = [];
      adjacent = [-1, 0, 1];
      for (_i = 0, _len = adjacent.length; _i < _len; _i++) {
        i = adjacent[_i];
        for (_j = 0, _len1 = adjacent.length; _j < _len1; _j++) {
          j = adjacent[_j];
          if (this.valid(i, j)) {
            result.push([i, j]);
          }
        }
      }
      return result;
    };

    Matrix.prototype.valid = function(x, y) {
      return (0 <= x && x < this.dim) && (0 <= y && y < this.dim);
    };

    Matrix.prototype.get = function(x, y) {
      return this._d[x][y];
    };

    Matrix.prototype.set = function(x, y, value) {
      return this._d[x][y] = value;
    };

    return Matrix;

  })();

}).call(this);

});

require.define("/maze/random.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {

  module.exports = {
    get: function(x, y) {
      return Math.round(Math.random() * 4) !== 4;
    }
  };

}).call(this);

});

require.define("/web/app.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var A_Star, BFS, Board, Canvas, DFS, Position, Random, State, getAlgorithm, getDim, getTransition, prim, random;

  Position = require('../state_space/position');

  Board = require('../state_space/board');

  State = require('../state_space/state');

  A_Star = require('../algs/a_star');

  DFS = require('../algs/dfs');

  BFS = require('../algs/bfs');

  Random = require('../algs/random');

  Canvas = require('../web/canvas');

  prim = require('../maze/prim');

  random = require('../maze/random');

  getDim = function() {
    var e;
    e = window.document.getElementById('dim');
    return parseInt(e.value);
  };

  getTransition = function() {
    var e;
    e = window.document.getElementById('transition');
    return parseInt(e.value);
  };

  getAlgorithm = function() {
    var e;
    e = document.getElementById('algorithm');
    return {
      DFS: DFS,
      BFS: BFS,
      Random: Random,
      A_Star: A_Star
    }[e.value];
  };

  $('form').submit(function(e) {
    var algorithm, board, canvas, dim, maze, path, start, transition;
    e.preventDefault();
    algorithm = getAlgorithm();
    dim = getDim();
    transition = getTransition();
    maze = random;
    board = new Board(maze, dim);
    start = new State(board.randomPosition(), board.randomPosition());
    canvas = new Canvas(board, dim, 500, transition);
    path = algorithm(start, board);
    return canvas.animate(path);
  });

}).call(this);

});
require("/web/app.coffee");
})();
