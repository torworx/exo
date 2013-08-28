var exo = require('../');
var t = require('chai').assert;
require("chai").Assertion.includeStack = true;

describe('common test', function() {

    var stuff, newStuff,
        date = new Date(),
        arr = [1, 2, 3, 4, 5];

    beforeEach(function() {
        stuff = {
            foo: 'torworx',
            bar: ['a', 'b', 'c'],
            x: false,
            y: {
                i: 1,
                s: 'nothing',
                b: true
            }
        };

        newStuff = {
            foo: 'awesome',
            bar: ['a', 'b', 'd'],
            y: {
                i: 2,
                d: date
            },
            z: 'zzz'
        }
    });

    it('#apply', function() {
        var result = exo.apply(stuff, newStuff);
        t.equal(result, stuff);
        t.deepEqual(result, {
            foo: 'awesome',
            bar: ['a', 'b', 'd'],
            x: false,
            y: {
                i: 2,
                d: date
            },
            z: 'zzz'
        });
    });

    it('#apply with filter', function() {
        var result = exo.apply(stuff, newStuff, {'bar':1, 'y':1});
        t.equal(result, stuff);
        t.deepEqual(result, {
            foo: 'awesome',
            bar: ['a', 'b', 'c'],
            x: false,
            y: {
                i: 1,
                s: 'nothing',
                b: true
            },
            z: 'zzz'
        });
    });

    it('#applyIf', function() {
        var result = exo.applyIf(stuff, newStuff);
        t.equal(result, stuff);
        t.deepEqual(result, {
            foo: 'torworx',
            bar: ['a', 'b', 'c'],
            x: false,
            y: {
                i: 1,
                s: 'nothing',
                b: true
            },
            z: 'zzz'
        });
    });

    it('#applyIf with filter', function() {
        var result = exo.applyIf(stuff, newStuff, {'z': 1});
        t.equal(result, stuff);
        t.deepEqual(result, {
            foo: 'torworx',
            bar: ['a', 'b', 'c'],
            x: false,
            y: {
                i: 1,
                s: 'nothing',
                b: true
            }
        });
    });

    it('#clone', function() {
        var result;

        result = exo.clone(stuff);
        t.notEqual(result, stuff);
        t.deepEqual(result, stuff);

        result = exo.clone(date);
        t.notEqual(result, date);
        t.deepEqual(result, date);

        result = exo.clone(arr);
        t.notEqual(result, arr);
        t.deepEqual(result, arr);

    });

    it('#merge', function() {
        var result = exo.merge(stuff, newStuff);
        t.equal(result, stuff);
        t.deepEqual(result, {
            foo: 'awesome',
            bar: ['a', 'b', 'd'],
            x: false,
            y: {
                i: 2,
                s: 'nothing',
                b: true,
                d: date
            },
            z: 'zzz'
        });
    });
});