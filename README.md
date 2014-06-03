# Crontab.js

the manager of setInterval and setTimeout.

## the core of the idea

Maintaining a queue, iterate over all those queue and execute it if needed when every time start.

## implementation

### Class

Crontab(interval, error)

* `interval` the interval time of crontab run. unit is ms, default is 400ms.
* `error` the maximum error of current time and last execute time. if `currTime + error - lastExecuteTime - intervalTime` greater than 0, then this item will be run.

#### getInstance()

Also, you can use `var crontab = Crontab.getInstance();` to get the only one instance.

This is for global invoke. return the last instance of Crontab. If no instance, create a new one.

### Method

#### on(time, fn[, context])

register a function. same as `window.setInterval`.

* `time` means the interval of function run. the unit is `ms`
* `fn` means the function which wait for run.
* `context` means the context of fn.

#### one(time, fn[, isRun])

like `on`, register once. same as `window.setTimeout`.

#### off([id])

clear a item which id is `id` in queue. if `id` not set, clear all queue.

#### start

start run crontab. this will be auto run when use `new Crontab()`.

#### stop

stop run crontab.

#### setInterval

restart set the interval time of crontab run.

this will run `stop` and `start` method in turn when it invoked.
