exo
=====

OOP tools for javascript.

## Features

* Work on both server and client side.
* Support CommonJS.
* Support statics, singleton, super call, private, mixins, inherits.

## Setup

exo supports both server side (CommonJS) and client side JavaScript (browser).

Browser:

``` html
<script src="exo.js" type="text/javascript"></script>
```

## API
### Class Declaration
There is just one single method you need to remember for class creation: `exo.define`. Its basic syntax is as follows:
``` javascript
exo.define(members);
```
* members is an object represents a collection of class members in key-value pairs

**Example**:
```javascript
var Person = exo.define({
    name: 'Unknown',

    constructor: function(name) {
        if (name) {
            this.name = name;
        }
    },

    say: function(text) {
        alert(text);
    }
});

var aaron = new Person('Aaron');
    aaron.say("Salad"); // alert("Salad");
```

### Class extention
```javascript
var Developer = exo.define({
    $extends: 'Person',
    constructor: function() {
    	Developer.$superclass.call(this);
	},
    say: function(text) {
    	Developer.$super.say.call(this, "print "+text);
    }
});
```

### Mixins
```javascript
var CanSing = exo.define({
     sing: function() {
         alert("I'm on the highway to hell...")
     }
});
var Musician = exo.define({
     $mixins: [CanSing]
})
```
In this case the Musician class will get a sing method from CanSing mixin.

But what if the Musician already has a sing method? Or you want to mix in two classes, both of which define sing? In such a cases it's good to define mixins as an object, where you assign a name to each mixin:
```javascript
var Musician = exo.define({
     $mixins: {
         canSing: CanSing
     },

     sing: function() {
         // delegate singing operation to mixin
         this.mixins.canSing.sing.call(this);
     }
})
```
In this case the sing method of Musician will overwrite the mixed in sing method. But you can access the original mixed in method through special mixins property.

### Inherits
Like `mixins`, but `inherits` just copy all parent's own properties and methods to sub class, `inhertis` has higher performance than `mixins` but less features than `mixins`.
```javascript
var Musician = exo.define({
     $inherits: [CanSing]
})
```

### Singleton
```javascript
var Logger = exo.define({
    $singleton: true,
    log: function(msg) {
        console.log(msg);
    }
});

Logger.log('Hello');
```
When `singleton` config set to true, the class will be instantiated as singleton

### Statics
Static members can be defined using the `statics` config
```javascript
var Computer = exo.define({
    $statics: {
        instanceCount: 0,
        factory: function(brand) {
            // 'this' in static methods refer to the class itself
            return new this({brand: brand});
        }
    },

    config: {
        brand: null
    },

    constructor: function(config) {
        this.initConfig(config);

        // the 'self' property of an instance refers to its class
        this.self.instanceCount ++;
    }
});

var dellComputer = Computer.factory('Dell');
var appleComputer = Computer.factory('Mac');

alert(appleComputer.getBrand()); // using the auto-generated getter to get the value of a config property. Alerts "Mac"

alert(Computer.instanceCount); // Alerts "2"
```
### Private properties
In some cases, it is helpful to create a nested scope to contain some private properties. The best way to do this is to pass a function instead of an object as the second parameter. This function will be called to produce the class body:
```javascript
var Bar = exo.define(function () {
     var id = 0;

     return {
         nextId: function () {
             return ++id;
         }
     };
 });
```
When using this form of exo.define, the function is passed tow references to its parent class and parent prototype. This can be used as an efficient way to access any parent class and parent prototype properties and functions:
```javascript
var Bar = exo.define(function(parentClass, parent) {

	return {
		constructor: function() {
			parentClass.call(this);
		},

		someMethod: function(arg) {
			parent.call(this, arg);
		}

	}
});
```