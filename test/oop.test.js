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
        a.$classname.should.equal('A');
        a.f.should.equal(1);
        a.f2.should.equal(2);
        a.m("s").should.equal("s");
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
        p1.name.should.equal('Torry');
        p1.country.should.equal('CN');
        p1.city.should.equal('BJ');
        p1.street.should.equal('XY');

        var p2 = new OvyChinaGuy("Leo");
        p2.setAddress("BJ", "XY");
        p2.name.should.equal('Leo', p2.name);
        p2.country.should.equal('China');
        p2.city.should.equal('BJ');
        p2.street.should.equal('XY');

        var p3 = new OvyBeijingLover("Mary");
        p3.setAddress("XY");
        p3.name.should.equal('Mary');
        p3.country.should.equal('China');
        p3.city.should.equal('Beijing');
        p3.street.should.equal('XY');

        var instanceofTest = p3 instanceof OvyBeijingLover &&
            p3 instanceof OvyChinaGuy &&
            p3 instanceof OvyPerson;
        instanceofTest.should.ok;
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
        A.f.should.equal(1);
        A.echo('Hello World').should.equal('Hello World');
    });

    it('define as singleton', function(){
        var A = exo.define({
            singleton: true,
            f: 1
        });
        A.f.should.equal(1);
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

        bar.name.should.equal("Bar", "Invalid extend behavior, constructor must be bound correctly");
        bar.opts.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.config.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.bind().should.be.ok;
        bar.unbind().should.not.be.ok;
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

        bar.name.should.equal("Bar", "Invalid extend behavior, constructor must be bound correctly");
        bar.opts.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.bind().should.be.ok;
        bar.unbind().should.not.be.ok;
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

        bar.name.should.equal("Bar", "Invalid extend behavior, constructor must be bound correctly");
        bar.opts.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.config.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.bind().should.be.ok;
        bar.unbind().should.not.be.ok;
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

        bar.name.should.equal("Bar", "Invalid extend behavior, constructor must be bound correctly");
        bar.opts.should.equal("nothing", "Invalid mixins behavior, constructor must be bound correctly");
        bar.bind().should.be.ok;
        bar.unbind().should.not.be.ok;
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
        p1.addresses['home'].should.be.ok;
        var p2 = new Person();
        p2.addresses['company'] = 'company';
        p1.addresses.should.not.eql(p2.addresses);
        should.not.exist(p2.addresses['home']);
        p2.addresses['company'].should.be.ok;
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

        (new BeijingPerson).name.should.equal('Beijing');
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
        p.name.should.equal('Beijing');
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

        p.name.should.equal("Mary");
        p.country.should.equal("China");
        p.city.should.equal("Beijing");
        p.street.should.equal("CH");
    });
});
