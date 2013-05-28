var exo = require('../'),
    should = require('should');

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
        result.should.equal(stuff);
        result.should.eql({
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
        result.should.equal(stuff);
        result.should.eql({
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
        result.should.equal(stuff);
        result.should.eql({
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
        result.should.equal(stuff);
        result.should.eql({
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
        result.should.not.equal(stuff);
        result.should.eql(stuff, '');

        result = exo.clone(date);
        result.should.not.equal(date);
        result.should.eql(date, '');

        result = exo.clone(arr);
        result.should.not.equal(arr);
        result.should.eql(arr, '');

    });

    it('#merge', function() {
        var result = exo.merge(stuff, newStuff);
        result.should.equal(stuff);
        result.should.eql({
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