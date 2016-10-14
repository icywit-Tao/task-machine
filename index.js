function* Gen() {
    while (1) {
        let valueObj = {};
        let result = yield valueObj;
        valueObj.output = '============No Tasks============';
        while (this.index < this.tasks.length) {
            let task = this.tasks[this.index++];
            valueObj.output = task(...result);
            result = yield valueObj;
        }
        valueObj.done = 1;
        yield valueObj;
    }
}
const NEXT = Symbol('next');
const SERIALIZE = Symbol('serialize');
const STARTON = Symbol('start-on');
Object.assign(Gen.prototype, {
    [NEXT]: function (...input) {
        var that = this;
        if (!that.value.done) {
            that.next(input);
            Promise.resolve(that.value.output).then(function (output) {
                that.value.done || console.log(output);
                output instanceof Array ? that[NEXT](...output) : that[NEXT](output);
            }).catch(function (err) {
                setTimeout(() => {
                    throw err;
                }, 0);
            });
        } else {
            // console.log('============Task Done============\noutput:');
            that[STARTON] = false;
            typeof that.resolve === 'function' && that.resolve(that.value.output);
        }
    },
    [SERIALIZE]: function (tasks, target) {
        for (let task of tasks) {
            try {
                if (typeof task === 'function') {
                    target.push(task);
                } else {
                    task && task[Symbol.iterator] && that[SERIALIZE](task, target);
                }
            } catch (e) {}
        }
    }
});
const PROTO = Gen.prototype;

function TaskMachine(...tasks) {
    Gen.prototype = Object.create(PROTO);
    var f = Gen.call(Gen.prototype);
    Object.assign(f, {
        next(input) {
            var that = this;
            var output = that.__proto__.next.call(that, input);
            Object.assign(that, output);
            return that;
        },
        init(...tasks) {
            var that = this;
            that.__proto__.tasks = [];
            that.__proto__.index = 0;
            that[SERIALIZE](tasks, that.__proto__.tasks);
            return that;
        },
        add(...tasks) {
            this.value && this.value.done ? this.init(...tasks) : this[SERIALIZE](tasks, this.__proto__.tasks);
            return this;
        },
        start(...input) {
            // console.log('============Task Start============')
            var that = this;
            if (!that[STARTON]) {
                that[STARTON] = true;
                that.next();
                that.value = that.value || {}
                return new Promise(function (resolve) {
                    that.resolve = resolve;
                    that[NEXT](...input);
                });
            } else {
                return Promise.resolve('============On Going============');
            }
        }
    });
    f.init(...tasks);
    return f;
}
module.exports = TaskMachine