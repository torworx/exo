;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function (root) {
    var _exo,
        exo = require('../lib/exo');

    if ("function" === typeof root.define && root.define.amd) {
        define([], function () {
            return exo;
        });
    } else {
        _exo = root.exo;
        root.exo = exo;
        exo.noConflict = function () {    // no conflict
            root.exo = _exo;
            return exo;
        };
    }
})(window);
},{"../lib/exo":2}],2:[function(require,module,exports){
"use strict";

var exo = {},
    AUTO_ID = 1000,
    objectPrototype = Object.prototype,
    toString = objectPrototype.toString,
// CLASS_RESERVED_KEYS = {$classname: 1, mixinId: 1, $mixinId: 1, $super: 1, $superclass: 1},
    CONFIG_RESERVED_KEYS = {extend: 1, constructor: 1, singleton: 1, statics: 1, mixins: 1, inherits: 1},
    TemplateClass = function () {};

function getAutoId(prefiex) {
    return (prefiex ? prefiex.toString() : '') + (++AUTO_ID);
}

function isFunction(value) {
    return value && typeof value === 'function';
}

function isObject(value) {
    return value && typeof value === 'object';
}

function isString(value) {
    return typeof value === 'string';
}

function Base() {
}

/**
 * Copies all the properties of config to the specified object.
 * Note that if recursive merging and cloning without referencing the original objects / arrays is needed, use
 * {@link exo#merge} instead.
 * @param {Object} object The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} [filter] The keys will be ignored
 * @return {Object} returns obj
 */
exo.apply = function (object, config, filter) {
    if (object && config && typeof config === 'object') {
        var property;

        for (property in config) {
            if (!filter || !filter[property]) {
                object[property] = config[property];
            }
        }
    }
    return object;
};

/**
 * Copies all the properties of config to object if they don't already exist.
 * @param {Object} object The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} [filter] The keys will be ignored
 * @return {Object} returns obj
 */
exo.applyIf = function (object, config, filter) {
    var property;

    if (object) {
        for (property in config) {
            if (!filter || !filter[property]) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }
    }

    return object;
};

function createProxy(fn, context) {
    return function () {
        return fn.apply(context, arguments);
    };
}

exo.apply(exo, {

    /**
     * Clone simple variables including array, {}-like objects, DOM nodes and Date without keeping the old reference.
     * A reference for the object itself is returned if it's not a direct decendant of Object.
     *
     * @param {Object} item The variable to clone
     * @return {Object} clone
     */
    clone: function (item) {
        var type,
            i,
            _clone,
            key;

        if (item === null || item === undefined) {
            return item;
        }

        type = toString.call(item);

        // Date
        if (type === '[object Date]') {
            return new Date(item.getTime());
        }

        // Array
        if (type === '[object Array]') {
            i = item.length;

            _clone = [];

            while (i--) {
                _clone[i] = exo.clone(item[i]);
            }
        }
        // Object
        else if (type === '[object Object]' && item.constructor === Object) {
            _clone = {};

            for (key in item) {
                _clone[key] = exo.clone(item[key]);
            }
        }

        return _clone || item;
    },

    /**
     * Merges any number of objects recursively without referencing them or their children.
     *
     *     var torworx = {
     *         companyName: 'torworx',
     *         products: ['exo', 'logair'],
     *         isSuperCool: true,
     *         office: {
     *             size: 1,
     *             location: 'SOHO',
     *             isFun: true
     *         }
     *     };
     *
     *     var newStuff = {
     *         companyName: 'Company Inc.',
     *         products: ['exo', 'logair', 'ndo', 'midst', 'aiur'],
     *         office: {
     *             size: 10,
     *             location: 'Beijing'
     *         }
     *     };
     *
     *     var company = exo.merge(torworx, newStuff);
     *
     *     // torworx and company then equals to
     *     {
     *         companyName: 'Company Inc.',
     *         products: ['exo', 'logair', 'ndo', 'midst', 'aiur'],
     *         isSuperCool: true,
     *         office: {
     *             size: 10,
     *             location: 'Beijing',
     *             isFun: true
     *         }
     *     }
     *
     * @param {Object} destination The object into which all subsequent objects are merged.
     * @param {Object...} object Any number of objects to merge into the destination.
     * @return {Object} merged The destination object with all passed objects merged in.
     */
    merge: function (destination) {
        var i = 1,
            ln = arguments.length,
            mergeFn = exo.merge,
            cloneFn = exo.clone,
            object, key, value, sourceKey;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                value = object[key];
                if (value && value.constructor === Object) {
                    sourceKey = destination[key];
                    if (sourceKey && sourceKey.constructor === Object) {
                        mergeFn(sourceKey, value);
                    }
                    else {
                        destination[key] = cloneFn(value);
                    }
                }
                else {
                    destination[key] = value;
                }
            }
        }

        return destination;
    },

    bind: function (fn, context) {
        var curriedArgs = Array.prototype.slice.call(arguments, 2);
        if (curriedArgs.length) {
            return function () {
                var allArgs = curriedArgs.slice(0);
                for (var i = 0, n = arguments.length; i < n; ++i) {
                    allArgs.push(arguments[i]);
                }
                fn.apply(context, allArgs);
            };
        } else {
            return createProxy(fn, context);
        }
    },

    /**
     * Forward `functions` from `from` to `to`.
     *
     * The `this` context of forwarded functions remains bound to the `to` object,
     * ensuring that property polution does not occur.
     *
     * @param {Object} from
     * @param {Object} to
     * @param {Array} functions
     * @api private
     */
    forward: function (from, to, functions) {
        for (var i = 0, len = functions.length; i < len; i++) {
            var method = functions[i];
            from[method] = exo.bind(to[method], to);
        }
    }
});


function wrap(fn, argsize) {
    argsize = argsize ? Math.max(argsize, fn.length) : fn.length;
    var wrapper;
    switch (argsize) {
    case 0:
        wrapper = function () {
            fn.call(this);
        };
        break;
    case 1:
        wrapper = function (a) {
            fn.call(this, a);
        };
        break;
    case 2:
        wrapper = function (a1, a2) {
            fn.call(this, a1, a2);
        };
        break;
    case 3:
        wrapper = function (a1, a2, a3) {
            fn.call(this, a1, a2, a3);
        };
        break;
    case 4:
        wrapper = function (a1, a2, a3, a4) {
            fn.call(this, a1, a2, a3, a4);
        };
        break;
    default:
        wrapper = function () {
            fn.apply(this, arguments);
        };
    }
    return wrapper;
}

function makeCtor(parent) {
    if (parent.constructor === Object) {
        return function () {
        };
    } else {
        return wrap(parent.constructor);
    }
}

exo.apply(exo, {

    /**
     * Returns a new object with the given object as the prototype chain. This method is
     * designed to mimic the ECMA standard `Object.create` method and is assigned to that
     * function when it is available.
     *
     * **NOTE** This method does not support the property definitions capability of the
     * `Object.create` method. Only the first argument is supported.
     *
     * @param {Object} object The prototype chain for the new object.
     */
    chain: function (object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    },


    /**
     * Defines a class or override. A basic class is defined like this:
     *
     *      exo.define('My.awesome.Class', {
     *          someProperty: 'something',
     *
     *          someMethod: function(s) {
     *              alert(s + this.someProperty);
     *          }
     *
     *          ...
     *      });
     *
     *      var obj = new My.awesome.Class();
     *
     *      obj.someMethod('Say '); // alerts 'Say something'
     *
     * To create an anonymous class, pass `null` for the `className`:
     *
     *      exo.define(null, {
     *          constructor: function () {
     *              // ...
     *          }
     *      });
     *
     * In some cases, it is helpful to create a nested scope to contain some private
     * properties. The best way to do this is to pass a function instead of an object
     * as the second parameter. This function will be called to produce the class
     * body:
     *
     *      exo.define('MyApp.foo.Bar', function () {
     *          var id = 0;
     *
     *          return {
     *              nextId: function () {
     *                  return ++id;
     *              }
     *          };
     *      });
     *
     * _Note_ that when using override, the above syntax will not override successfully, because
     * the passed function would need to be executed first to determine whether or not the result
     * is an override or defining a new object. As such, an alternative syntax that immediately
     * invokes the function can be used:
     *
     *      exo.define('MyApp.override.BaseOverride', function () {
     *          var counter = 0;
     *
     *          return {
     *              override: 'exo.Component',
     *              logId: function () {
     *                  console.log(++counter, this.id);
     *              }
     *          };
     *      }());
     *
     *
     * When using this form of `exo.define`, the function is passed a reference to its
     * class. This can be used as an efficient way to access any static properties you
     * may have:
     *
     *      exo.define('MyApp.foo.Bar', function (Bar) {
     *          return {
     *              statics: {
     *                  staticMethod: function () {
     *                      // ...
     *                  }
     *              },
     *
     *              method: function () {
     *                  return Bar.staticMethod();
     *              }
     *          };
     *      });
     *
     * @param {String|Object|Function|null} className The class name to create in string dot-namespaced format, for example:
     * 'My.very.awesome.Class', 'FeedViewer.plugin.CoolPager'
     * It is highly recommended to follow this simple convention:
     *  - The root and the class name are 'CamelCased'
     *  - Everything else is lower-cased
     * Pass `null` to create an anonymous class.
     * @param {Object|Function|?} data The key - value pairs of properties to apply to this class. Property names can be of any valid
     * strings, except those in the reserved listed below:
     *  - `extend`
     *  - `mixins`
     *  - `inherits`
     *  - `singleton`
     *  - `statics`
     *
     * @return {Object}
     * @member exo
     */
    define: function (className, data) {
        var hasClassName = isString(className);
        if (!data) {
            data = (hasClassName ? {} : className) || {};
        }

        if (hasClassName) {
            data.$classname = className;
        } else {
            data.$classname = null;
        }

        var _extend = data.extend,
            Parent;
        if (_extend && !isObject(_extend)) {
            Parent = _extend;
        } else {
            Parent = Base;
        }
        return exo.extend(Parent, data);
    },


    /**
     * Same as `define`, but first argument should be the super class and ignore `extend` property in `data`.
     * @param {Object|null} parentClass
     * @param {Object} data
     * @returns {Object}
     */
    extend: function(parentClass, data) {
        if (!data) {
            data = parentClass;
            parentClass = Base;
        }
        var parent = parentClass.prototype,
            prototype = exo.chain(parent),
            body = (isFunction(data) ? data.call(prototype, parent, parentClass) : data) || {},
            Clazz;

        if (isFunction(body)) {
            Clazz = body;
        } else if (body.constructor !== Object) {
            Clazz = body.constructor;
        } else {
            Clazz = makeCtor(parent);
        }

        prototype.constructor = Clazz;
        Clazz.prototype = prototype;

        // the '$super' property of class refers to its super prototype
        Clazz.$super = parent;
        // the '$superclass' property of class refers to its super class
        Clazz.$superclass = parentClass;

        if (typeof body === 'object') {
            exo._extend(Clazz, body, prototype);
            if (body.singleton) {
                Clazz = new Clazz();
            }
        }

        return Clazz;
    },

    _extend: function (targetClass, data, targetPrototype) {
        var prototype = targetPrototype || targetClass.prototype,
            _statics = data.statics,
            _mixins = data.mixins,
            _inherits = data.inherits;

        if (_statics) {
            // copy static properties from statics to class
            exo.apply(targetClass, _statics);
        }
        if (_mixins) {
            exo.mixins(targetClass, _mixins, targetPrototype);
        }
        if (_inherits) {
            exo.inherits(targetClass, _inherits, targetPrototype);
        }

        exo.apply(prototype, data, CONFIG_RESERVED_KEYS);

        if (data.toString !== Object.prototype.toString) {
            prototype.toString = data.toString;
        }
    },

    /**
     *
     * @param targetClass
     * @param inherits
     * @param targetPrototype
     */
    inherits: function (targetClass, inherits, targetPrototype) {
        var i, ln;

        if (!targetPrototype) {
            targetPrototype = targetClass.prototype;
        }

        if (inherits instanceof Array) {
            for (i = 0, ln = inherits.length; i < ln; i++) {
                exo._mixin(targetClass, null, inherits[i], targetPrototype);
            }
        }
        else {
            for (var mixinName in inherits) {
                if (inherits.hasOwnProperty(mixinName)) {
                    exo._mixin(targetClass, null, inherits[mixinName], targetPrototype);
                }
            }
        }
    },

    /**
     *
     * @param targetClass
     * @param mixins
     * @param targetPrototype
     */
    mixins: function (targetClass, mixins, targetPrototype) {
        var name, item, i, ln;

        if (!targetPrototype) {
            targetPrototype = targetClass.prototype;
        }

        if (mixins instanceof Array) {
            for (i = 0, ln = mixins.length; i < ln; i++) {
                item = mixins[i];
                name = item.prototype.mixinId || item.$mixinId;
                if (!name) {
                    name = item.$mixinId = getAutoId('mixin_');
                }

                exo._mixin(targetClass, name, item, targetPrototype);
            }
        }
        else {
            for (var mixinName in mixins) {
                if (mixins.hasOwnProperty(mixinName)) {
                    exo._mixin(targetClass, mixinName, mixins[mixinName], targetPrototype);
                }
            }
        }
    },

    _mixin: function (target, name, mixinClass, targetPrototype) {
        var mixin = mixinClass.prototype,
            prototype = targetPrototype || target.prototype,
            key;

        if (name) {
            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = exo.chain(prototype.mixins);
                }
                else {
                    prototype.mixins = {};
                }
            }
        }

        for (key in mixin) {
            if (name && (key === 'mixins')) {
                exo.merge(prototype.mixins, mixin[key]);
            }
            else if (typeof prototype[key] === 'undefined' && key !== 'mixinId') {
                prototype[key] = mixin[key];
            }
        }
        if (name) {
            prototype.mixins[name] = mixin;
        }
    }
});


/* Initialization */
module.exports = exports = exo;

},{}]},{},[1])
;