/**
 * Author: yss
 */

(function(global) {

var instance = null;

/**
 * for manage setTimeout and setInterval
 * @param {Number} [interval] default: 400ms
 * @param {Number} [tolerance] default: 100ms tolerance < interval
 */
function Crontab(interval, tolerance) {
    if (!(this instanceof Crontab)) {
        return new Crontab(interval, tolerance);
    }
    this._stack = {};
    this._id = 0;
    this._tolerance = tolerance || 100;
    this.setIntervalTime(interval);
    return this;
}

Crontab.prototype = {
    /**
     * register a setInterval
     * @param {Function} fn
     * @param {Number} time
     * @param {Any} [context]
     * @return {Number}
     */
    on: function(fn, time, context) {
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
     * @param {Function} fn
     * @param {Number} time
     * @param {Any} [context]
     * @return {Number}
     */
    one: function(fn, time, context) {
        var _this = this;
        var id =_this.on(function() {
            fn && fn.call(this);
            _this.off(id);
        }, time, context);

        return id;
    },

    /**
     * alias to `on`
     */
    setInterval: function() {
        this.on.apply(this, arguments);
    },

    /**
     * alias to `off(id)`
     * @param {Number} id
     */
    clearInterval: function(id) {
        id && this.off(id);
    },

    /**
     * alias to `one`
     */
    setTimeout: function() {
        this.one.apply(this, arguments);
    },

    /**
     * alias to `off(id)`
     * @param {Number} id
     */
    clearTimeout: function(id) {
        id && this.off(id);
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
     * set the config of interval
     * @param {Number} [interval] default: 400ms
     */
    setIntervalTime: function(interval) {
        interval = interval || 400;
        if (this._interval !== interval) {
            this._interval = interval;
            this.stop();
            this.start();
        }
    },

    /**
     * set the config of tolerance
     * @param tolerance
     */
    setToleranceTime: function(tolerance) {
        if (tolerance && tolerance >= 0 && this._interval > tolerance) {
            this._tolerance = tolerance;
        }
    },

    _run: function() {
        var stack = this._stack,
            currTime = this._getTime() + this._tolerance,
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

        currTime -= this._tolerance;
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
};

/**
 * for global invoke.
 */
Crontab.getInstance = function() {
    return instance || Crontab();
};

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
