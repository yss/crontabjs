(function(win) {

/**
 * for manage setTimeout and setInterval
 * @param {Number} [interval] default: 400ms
 * @param {Number} [error] default: 100ms
 */
function Crontab(interval, error) {
    if (!(this instanceof Crontab)) {
        return new Crontab(interval);
    }
    this._stack = {};
    this._id = 0;
    this._error = error;
    this.setInterval(interval);
    return this;
}

Crontab.prototype = {
    on: function(time, fn) {
        this._stack[this._id++] = {
            time: time,
            fn: fn
        };
    },

    off: function(id) {
        if (id) {
            delete this._stack[id];
        } else {
            this._stack = {};
        }
    },

    one: function(time, fn) {
        var _this = this;
        var id =_this.on(time, function() {
            fn && fn.call(this);
            _this.off(id);
        });

        return id;
    },

    start: function() {
        var _this = this;
        _this._startTime = new Date().getTime();
        _this._timer = win.setInterval(function() {
            _this._run();
        }, _this.interval);
    },

    stop: function() {
        win.clearInterval(_this._timer);
    },

    setInterval: function(interval) {
        interval = interval || 400;
        if (this._interval !== interval) {
            this._interval = interval;
            this.stop();
            this.start();
        }
    },

    _run: function() {
        var stack = this.stack,
            time = new Date().getTime() - this._startTime + this._error,
            key;
        for(key in stack) {
            if (stack[key].time < time) {
                stack[key].fn.call(win);
            }
        }
    }
}

win.Crontab = Crontab;
})(window);
