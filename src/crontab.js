(function(win) {

/**
 * for manage setTimeout and setInterval
 * @param {Number} [interval] default: 400ms
 * @param {Number} [error] default: 100ms error < interval
 */
function Crontab(interval, error) {
    if (!(this instanceof Crontab)) {
        return new Crontab(interval);
    }
    this._stack = {};
    this._id = 0;
    this._error = error || 100;
    this.setInterval(interval);
    return this;
}

Crontab.prototype = {
    /**
     * register a setInterval
     * @param {Number} time
     * @param {Function} fn
     * @return {Number}
     */
    on: function(time, fn) {
        this._stack[++this._id] = {
            time: time,
            last: new Date().getTime(),
            fn: fn
        };
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
     * @return {Number}
     */
    one: function(time, fn) {
        var _this = this;
        var id =_this.on(time, function() {
            fn && fn.call(this);
            _this.off(id);
        });

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
        _this._timer = win.setInterval(function() {
            _this._run();
        }, _this._interval);
    },

    /**
     * stop the crontab.
     */
    stop: function() {
        this._timer && win.clearInterval(this._timer);
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
            currTime = new Date().getTime() + this._error,
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

        runFn.sort(function(a, b) {
            return a.t < b.t;
        });

        while ((key = runFn.pop())) {
            stack[key.k].fn.call(win);
        }
    }
}

win.Crontab = Crontab;
})(window);
