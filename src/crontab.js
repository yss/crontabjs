/**
 * Author: yss
 */

(function(global) {

var instance = null;

/**
 * for manage setTimeout and setInterval
 * @param {Number} [interval] default: 400ms
 * @param {Number} [error] default: 100ms error < interval
 */
function Crontab(interval, error) {
    if (!(this instanceof Crontab)) {
        return new Crontab(interval, error);
    }
    this._stack = {};
    this._id = 0;
    this._error = error || 100;
    this.setInterval(interval);
    return (instance = this);
}

Crontab.prototype = {
    /**
     * register a setInterval
     * @param {Number} time
     * @param {Function} fn
     * @param {Any} [context]
     * @return {Number}
     */
    on: function(time, fn, context) {
        var obj = {
            time: time,
            last: this._getTime(),
            fn: fn
        };

        context && (obj.context = context);
        this._stack[++this._id] = obj;
        return this._id;
    },

    /**
     * remove setInterval, setTimeout
     * @param {Number} id
     */
    off: function(id) {
        if (id) {
            delete this._stack[id];
        } else {
            this._stack = {};
        }
    },

    /**
     * register once. equal to setTimeout
     * @param {Number} time
     * @param {Function} fn
     * @param {Any} [context]
     * @return {Number}
     */
    one: function(time, fn, context) {
        var _this = this;
        var id =_this.on(time, function() {
            fn && fn.call(this);
            _this.off(id);
        }, context);

        return id;
    },

    /**
     * start the crontab.
     */
    start: function() {
        var _this = this;
        // for repeat start
        if (this._timer) {
            return;
        }
        _this._timer = setInterval(function() {
            _this._run();
        }, _this._interval);
    },

    /**
     * stop the crontab.
     */
    stop: function() {
        this._timer && clearInterval(this._timer);
        this._timer = null;
    },

    /**
     * set the interval config
     * @param {Number} [interval] default: 400ms
     */
    setInterval: function(interval) {
        interval = interval || 400;
        if (this._interval !== interval) {
            this._interval = interval;
            this.stop();
            this.start();
        }
    },

    _run: function() {
        var stack = this._stack,
            currTime = this._getTime() + this._error,
            key,
            runTime,
            runFn = [];
        for(key in stack) {
            runTime = stack[key].last + stack[key].time;
            if (currTime > runTime) {
                runFn.push({
                    t: runTime,
                    k: key
                });
            }
        }

        // empty
        if (!runFn.length) {
            return;
        }

        // sort by time desc
        runFn.sort(function(a, b) {
            return a.t < b.t;
        });

        currTime -= this._error;
        while ((key = runFn.pop())) {
            stack[key.k].last = currTime;
            stack[key.k].fn.call(stack[key.k].context || global);
        }
    },

    /**
     * get the current Time, unit is ms
     */
    _getTime: function() {
        return Date.now ? Date.now() : +new Date();
    }
}

/**
 * for global invoke.
 */
Crontab.getInstance = function() {
    return instance || Crontab();
}

// for node environment
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = Crontab;
} else if ( typeof define === "function" && (define.amd || define.cmd)) {
    // for cmd, amd
    define("crontab", [], function() { return Crontab; } );
} else {
    // for global environment. like window
    global.Crontab = Crontab;
}
})(this);
