var Benchmark = require('benchmark');
var cases = require('./cases');

var suite = new Benchmark.Suite;

suite.on('cycle',function (event) {
        console.log(String(event.target));
    }).on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    });

Object.keys(cases).forEach(function (key) {
    suite.add(key, function () {
        var p = new cases[key].BeijingLover('TY');
        p.setAddress('BJ');
    });
});


suite.run({ 'async': true });