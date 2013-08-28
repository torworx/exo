var exo = require("../");
var t = require("chai").assert;
require("chai").Assertion.includeStack = true;

describe("oop testing", function() {

    it('define a class', function(){
        var A = exo.define('A', {
            f: 1,
            constructor: function () {
                this.f2 = 2;
            },
            m: function (p) {
                return p;
            }
        });

        var a = new A();
        t.equal(a.$classname, 'A');
        t.equal(a.f, 1);
        t.equal(a.f2, 2);
        t.equal(a.m("s"), "s");
    });

    it('define with extend', function(){

        var ExoPerson = exo.define({
            constructor: function(name) {
                this.name = name;
            },
            setAddress: function(country, city, street) {
                this.country = country;
                this.city = city;
                this.street = street;
            }
        });

        var ExoChinaGuy = exo.define({
            $extends: ExoPerson,
            constructor: function(name) {
                ExoChinaGuy.$superclass.call(this, name)
            },
            setAddress: function(city, street) {
                ExoChinaGuy.$super.setAddress.call(this, 'China', city, street);
            }
        });

        var ExoBeijingLover = exo.define({
            $extends: ExoChinaGuy,
            constructor: function(name) {
                ExoBeijingLover.$superclass.call(this, name);
            },
            setAddress: function(street) {
                ExoBeijingLover.$super.setAddress.call(this, 'Beijing', street);
            }
        });


        var p1 = new ExoPerson("Torry");
        p1.setAddress("CN", "BJ", "XY");
        t.equal(p1.name, 'Torry');
        t.equal(p1.country, 'CN');
        t.equal(p1.city, 'BJ');
        t.equal(p1.street, 'XY');

        var p2 = new ExoChinaGuy("Leo");
        p2.setAddress("BJ", "XY");
        t.equal(p2.name, 'Leo', p2.name);
        t.equal(p2.country, 'China');
        t.equal(p2.city, 'BJ');
        t.equal(p2.street, 'XY');

        var p3 = new ExoBeijingLover("Mary");
        p3.setAddress("XY");
        t.equal(p3.name, 'Mary');
        t.equal(p3.country, 'China');
        t.equal(p3.city, 'Beijing');
        t.equal(p3.street, 'XY');

        var instanceofTest = p3 instanceof ExoBeijingLover &&
            p3 instanceof ExoChinaGuy &&
            p3 instanceof ExoPerson;
        t.ok(instanceofTest);
    });

    it('define with statics', function(){
        var A = exo.define({
            $statics: {
                f: 1,
                echo: function(msg) {
                    return msg;
                }
            }
        });
        t.equal(A.f, 1);
        t.equal(A.echo('Hello World'), 'Hello World');
    });

    it('define as singleton', function(){
        var A = exo.define({
            $singleton: true,
            f: 1
        });
        t.equal(A.f, 1);
    });

    it('define with private', function(){
        var Person = exo.define(function(){
            var MIN_AGE =   1,                             // private variables
                MAX_AGE = 150;

            function isValidAge(age) {                     // private method
                return age >= MIN_AGE && age <= MAX_AGE;
            }

            return {
                constructor: function(name, age) {
                    if ( !isValidAge(age)) {
                        throw "Invalid parameter";
                    }

                    this.name = name;
                    this.age  = age;
                }
            };
        });
        t.throws(function() {
            new Person('Tao Yuan', 0);
        });
        t.throws(function() {
            new Person('Tao Yuan', 151);
        });
        t.doesNotThrow(function() {
            new Person('Tao Yuan', 32);
        });
    });

    it('define with mixins', function(){
        var Options = exo.define({
            setOptions: function(opts) {
                this.opts = opts;
            }
        });

        var Events = exo.define({
            bind: function(event, fn) {
                return true;
            },
            unbind: function(event, fn) {
                return false;
            }
        });

        var Foo = exo.define({
            constructor: function(name) {
                this.name = name;
            }
        });

        var Bar = exo.define({
            $extends: Foo,
            $mixins: {
                options: Options,
                events: Events
            },
            setOptions: function(opts) {
                this.config = opts;
                this.$mixins.options.setOptions.call(this, opts);
            }
        });


        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        t.equal(bar.name, "Bar");
        t.equal(bar.opts, "nothing");
        t.equal(bar.config, "nothing");
        t.ok(bar.bind());
        t.notOk(bar.unbind());
    });

    it('define with inherits', function() {
        var Options = exo.define({
            setOptions: function(opts) {
                this.opts = opts;
            }
        });

        var Events = exo.define({
            bind: function(event, fn) {
                return true;
            },
            unbind: function(event, fn) {
                return false;
            }
        });

        var Foo = exo.define({
            constructor: function(name) {
                this.name = name;
            }
        });

        var Bar = exo.define({
            $extends: Foo,
            $inherits: [Options, Events]
        });


        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        t.equal(bar.name, "Bar");
        t.equal(bar.opts, "nothing");
        t.ok(bar.bind());
        t.notOk(bar.unbind());
    });

    it("mixins classes to a plain Class with exo.mixins", function(){
        var Options = exo.define({
            setOptions: function(opts) {
                this.opts = opts;
            }
        });

        var Events = exo.define({
            bind: function(event, fn) {
                return true;
            },
            unbind: function(event, fn) {
                return false;
            }
        });

        var Foo = exo.define({
            constructor: function(name) {
                this.name = name;
            }
        });

        var Bar = exo.define({
            $extends: Foo,
            setOptions: function(opts) {
                this.config = opts;
                this.$mixins.options.setOptions.call(this, opts);
            }
        });

        exo.mixins(Bar, {
            options: Options,
            events: Events
        });

        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        t.equal(bar.name, "Bar");
        t.equal(bar.opts, "nothing");
        t.equal(bar.config, "nothing");
        t.ok(bar.bind());
        t.notOk(bar.unbind());
    });


    it("inherits classes to a plain Class with exo.inherits", function(){
        var Options = exo.define({
            setOptions: function(opts) {
                this.opts = opts;
            }
        });

        var Events = exo.define({
            bind: function(event, fn) {
                return true;
            },
            unbind: function(event, fn) {
                return false;
            }
        });

        var Foo = exo.define({
            constructor: function(name) {
                this.name = name;
            }
        });

        var Bar = exo.define({
            $extends: Foo
        });

        exo.inherits(Bar, [Options, Events]);

        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        t.equal(bar.name, "Bar");
        t.equal(bar.opts, "nothing");
        t.ok(bar.bind());
        t.notOk(bar.unbind());
    });

    it("object property", function(){
        var Person = exo.define({
            addresses: null,
            constructor: function() {
                this.addresses = {};
            }
        });
        var p1 = new Person();
        p1.addresses['home'] = 'home';
        t.ok(p1.addresses['home']);
        var p2 = new Person();
        p2.addresses['company'] = 'company';
        t.notDeepEqual(p1.addresses, p2.addresses);
        t.notOk(p2.addresses['home']);
        t.ok(p2.addresses['company']);
    });


    it("define extend from function", function() {
        function Person(name) {
            this.name = name;
        }

        var BeijingPerson = exo.define({
            $extends: Person,
            constructor: function() {
                BeijingPerson.$superclass.call(this, 'Beijing');
            }
        });

        t.equal((new BeijingPerson).name, 'Beijing');
    });

    it("define subclass without constructor", function() {
        function Person(name) {
            this.name = name;
        }

        var BeijingPerson = exo.define({
            $extends: Person,
            setName: function(name) {
                this.name = name;
            }
        });

        var p = new BeijingPerson('Beijing');
        t.equal(p.name, 'Beijing');
    });

    it("exo closure", function() {

        var ExoPerson2 = exo.extend(function() {

            return {
                constructor:function (name) {
                    this.name = name;
                },
                setAddress:function (country, city, street) {
                    this.country = country;
                    this.city = city;
                    this.street = street;
                }
            }
        });

        var ExoChinaGuy2 = exo.extend(ExoPerson2, function($super) {
            return {
                setAddress:function (city, street) {
                    $super.setAddress('China', city, street);
                }
            }
        });

        var ExoBeijingLover2 = exo.extend(ExoChinaGuy2, function ($super) {
            return {
                setAddress:function (street) {
                    $super.setAddress('Beijing', street);
                }
            }
        });

        var p = new ExoBeijingLover2("Mary");
        p.setAddress("CH");

        t.equal(p.name, "Mary");
        t.equal(p.country, "China");
        t.equal(p.city, "Beijing");
        t.equal(p.street, "CH");
    });
});
