var TaskMachine = require('task-machine');
var a = function (a = 1, b = 1) {
    return [b, a + b];
};
var g = new TaskMachine(a, a);
var t = new TaskMachine(a, function (v) {
    return new Promise(function (resolve, rej) {
        t.add(a, a, a);
        setTimeout(() => resolve(v + v), 3000);
    });
}, a);


// console.log(t.tasks, g.tasks);

g.add(a, a, a, a);
g.start(1, 2).then((result) => console.log(result));
g.start().then((result) => console.log(result));
g.start().then((result) => console.log(result));
setTimeout(function () {
    // g.add(a, a, a, a);
    g.start(11111).then((result) => console.log(result));
    // g.start().then((result) => console.log(result));
}, 100);
setTimeout(function () {
    g.add(a, a, a, a).start().then((result) => console.log(result));
    g.start().then((result) => console.log(result));
}, 200);
t.start(1, 20).then((result) => console.log(result));