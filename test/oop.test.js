var exo = require("../"),
    should = require("should");

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
        should.equal('A', a.$classname);
        should.equal(a.f, 1);
        should.equal(a.f2, 2);
        should.equal(a.m("s"), "s");
    });

    it('define with extend', function(){

        // OvyJS Define
        var OvyPerson = exo.define({
            constructor: function(name) {
                this.name = name;
            },
            setAddress: function(country, city, street) {
                this.country = country;
                this.city = city;
                this.street = street;
            }
        });

        var OvyChinaGuy = exo.define({
            extend: OvyPerson,
            constructor: function(name) {
                OvyChinaGuy.$superclass.call(this, name)
            },
            setAddress: function(city, street) {
                OvyChinaGuy.$super.setAddress.call(this, 'China', city, street);
            }
        });

        var OvyBeijingLover = exo.define({
            extend: OvyChinaGuy,
            constructor: function(name) {
                OvyBeijingLover.$superclass.call(this, name);
            },
            setAddress: function(street) {
                OvyBeijingLover.$super.setAddress.call(this, 'Beijing', street);
            }
        });


        var p1 = new OvyPerson("Torry");
        p1.setAddress("CN", "BJ", "XY");
        should.equal('Torry', p1.name);
        should.equal('CN', p1.country);
        should.equal('BJ', p1.city);
        should.equal('XY', p1.street);

        var p2 = new OvyChinaGuy("Leo");
        p2.setAddress("BJ", "XY");
        should.equal('Leo', p2.name);
        should.equal('China', p2.country);
        should.equal('BJ', p2.city);
        should.equal('XY', p2.street);

        var p3 = new OvyBeijingLover("Mary");
        p3.setAddress("XY");
        should.equal('Mary', p3.name);
        should.equal('China', p3.country);
        should.equal('Beijing', p3.city);
        should.equal('XY', p3.street);

        var instanceofTest = p3 instanceof OvyBeijingLover &&
            p3 instanceof OvyChinaGuy &&
            p3 instanceof OvyPerson;
        should.ok(instanceofTest, 'failed the `instanceof` test.');
    });

    it('define with statics', function(){
        var A = exo.define({
            statics: {
                f: 1,
                echo: function(msg) {
                    return msg;
                }
            }
        });
        should.equal(1, A.f);
        should.equal('Hello World', A.echo('Hello World'));
    });

    it('define as singleton', function(){
        var A = exo.define({
            singleton: true,
            f: 1
        });
        should.equal(1, A.f);
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
        (function() {
            new Person('Tao Yuan', 0);
        }).should.throw();
        (function() {
            new Person('Tao Yuan', 151);
        }).should.throw();
        (function() {
            new Person('Tao Yuan', 32);
        }).should.not.throw();
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
            extend: Foo,
            mixins: {
                options: Options,
                events: Events
            },
            setOptions: function(opts) {
                this.config = opts;
                this.mixins.options.setOptions.call(this, opts);
            }
        });


        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        should.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
        should.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.equal(bar.config, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.ok(bar.bind(), "Invalid mixins behavior");
        should.equal( !bar.unbind(), true, "Invalid mixins behavior");
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
            extend: Foo,
            inherits: [Options, Events]
        });


        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        should.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
        should.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.ok(bar.bind(), "Invalid mixins behavior");
        should.equal( !bar.unbind(), true, "Invalid mixins behavior");
    });

    it("mixins classes to a plain Class with exo.mixin", function(){
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
            extend: Foo,
            setOptions: function(opts) {
                this.config = opts;
                this.mixins.options.setOptions.call(this, opts);
            }
        });

        exo.mixins(Bar, {
            options: Options,
            events: Events
        });

        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        should.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
        should.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.equal(bar.config, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.ok(bar.bind(), "Invalid mixins behavior");
        should.equal( !bar.unbind(), true, "Invalid mixins behavior");
    });


    it("inherits classes to a plain Class with exo.inherit", function(){
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
            extend: Foo
        });

        exo.inherits(Bar, [Options, Events]);

        var bar = new Bar("Bar");
        bar.setOptions("nothing");

        should.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
        should.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
        should.ok(bar.bind(), "Invalid mixins behavior");
        should.equal( !bar.unbind(), true, "Invalid mixins behavior");
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
        should.ok(p1.addresses['home']);
        var p2 = new Person();
        p2.addresses['company'] = 'company';
        should.notEqual(p2.addresses, p1.addresses);
        should.ok(!p2.addresses['home']);
        should.ok(p2.addresses['company']);
    });


    it("define extend from function", function() {
        function Person(name) {
            this.name = name;
        }

        var BeijingPerson = exo.define({
            extend: Person,
            constructor: function() {
                BeijingPerson.$superclass.call(this, 'Beijing');
            }
        });

        should.equal((new BeijingPerson).name, 'Beijing');
    });

    it("define subclass without constructor", function() {
        function Person(name) {
            this.name = name;
        }

        var BeijingPerson = exo.define({
            extend: Person,
            setName: function(name) {
                this.name = name;
            }
        });

        var p = new BeijingPerson('Beijing');
        should.equal(p.name, 'Beijing');
    });

    it("exo closure", function() {

        var OvyPerson2 = exo.extend(function() {

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

        var OvyChinaGuy2 = exo.extend(OvyPerson2, function($super) {
            return {
                setAddress:function (city, street) {
                    $super.setAddress('China', city, street);
                }
            }
        });

        var OvyBeijingLover2 = exo.extend(OvyChinaGuy2, function ($super) {
            return {
                setAddress:function (street) {
                    $super.setAddress('Beijing', street);
                }
            }
        });

        var p = new OvyBeijingLover2("Mary");
        p.setAddress("CH");

        should.equal(p.name, "Mary");
        should.equal(p.country, "China");
        should.equal(p.city, "Beijing");
        should.equal(p.street, "CH");
    });
});
