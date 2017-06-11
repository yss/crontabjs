/**
 * Author: yss
 */

let instance = null;

/**
 * for manage setTimeout and setInterval
 * @param {Number} [interval] default: 400ms
 * @param {Number} [tolerance] default: 100ms tolerance < interval
 */
class Crontab {

    constructor (interval, tolerance) {
        this._store = new Map();
        this._id = 0;
        this._tolerance = tolerance || 100;
        this.setIntervalTime(interval);
    }

    /**
     * register a setInterval
     * @param {Function} fn
     * @param {Number} time
     * @param {Any} [context]
     * @return {Number}
     */
    on (fn, time, context) {
        this._store.set(++this._id, {
            last: Date.now(),
            fn,
            time,
            context
        });

        return this._id;
    }

    /**
     * remove setInterval, setTimeout
     * @param {Number} id
     */
    off (id) {
        if (id) {
            this._store.delete(id);
        } else {
            this._store.clear();
        }
    }

    /**
     * register once. equal to setTimeout
     * @param {Function} fn
     * @param {Number} time
     * @param {Any} [context]
     * @return {Number}
     */
    one (fn, time, context) {
        let _this = this;
        const id = _this.on(function() {
            fn && fn.call(this);

            _this.off(id);
        }, time, context);

        return id;
    }

    /**
     * alias to `on`
     */
    setInterval () {
        this.on.apply(this, arguments);
    }

    /**
     * alias to `off(id)`
     * @param {Number} id
     */
    clearInterval (id) {
        id && this.off(id);
    }

    /**
     * alias to `one`
     */
    setTimeout () {
        this.one.apply(this, arguments);
    }

    /**
     * alias to `off(id)`
     * @param {Number} id
     */
    clearTimeout (id) {
        id && this.off(id);
    }

    /**
     * start the crontab.
     */
    start () {
        let _this = this;
        // for repeat start
        if (_this._timer) {
            return;
        }
        _this._timer = setTimeout(function() {
            _this._run();
            _this._timer = null;
            _this.start();
        }, _this._interval);
    }

    /**
     * stop the crontab.
     */
    stop () {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    /**
     * set the config of interval
     * @param {Number} [interval] default: 400ms
     */
    setIntervalTime (interval) {
        interval = interval || 400;
        if (this._interval !== interval) {
            this._interval = interval;
            this.stop();
            this.start();
        }
    }

    /**
     * set the config of tolerance
     * @param tolerance
     */
    setToleranceTime (tolerance) {
        if (tolerance && tolerance >= 0 && this._interval > tolerance) {
            this._tolerance = tolerance;
        }
    }

    _run () {
        let currentTime = Date.now() + this._tolerance;
        let runStack = [];

        for (let value of this._store.values()) {
            let runTime = value.last + value.time;

            if (currentTime > runTime) {
                runStack.push({
                    runTime,
                    value
                });
            }
        }

        // empty
        if (runStack.length === 0) {
            return;
        }

        currentTime -= this._tolerance;

        // sort by time ASC and running one by one
        runStack.sort((a, b) => a.runTime - b.runTime)
            .forEach(item => {
                let value = item.value;
                value.last = currentTime;
                value.fn.call(value.context || null);
            });

    }

    /**
     * for global invoke.
     */
    static getInstance () {
        return instance || new Crontab();
    }
}

module.exports = Crontab;
