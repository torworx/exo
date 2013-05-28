(function (ctx, version, undefined, _exo, exo) {
    "use strict";

    var AUTO_ID = 1000,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
    // CLASS_RESERVED_KEYS = {$classname: 1, mixinId: 1, $mixinId: 1, $super: 1, $superclass: 1},
        CONFIG_RESERVED_KEYS = {extend: 1, constructor: 1, singleton: 1, statics: 1, mixins: 1, inherits: 1},
        TemplateClass = function () {
        };

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

    /**
     * Copies all the properties of config to the specified object.
     * Note that if recursive merging and cloning without referencing the original objects / arrays is needed, use
     * {@link exo#merge} instead.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} [filter] The keys will be ignored
     * @return {Object} returns obj
     */
    function apply(object, config, filter) {
        if (object && config && typeof config === 'object') {
            var property;

            for (property in config) {
                if (!filter || !filter[property]) {
                    object[property] = config[property];
                }
            }
        }
        return object;
    }

    /**
     * Copies all the properties of config to object if they don't already exist.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} [filter] The keys will be ignored
     * @return {Object} returns obj
     */
    function applyIf(object, config, filter) {
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
    }

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
    function merge(destination) {
        var i = 1,
            ln = arguments.length,
            mergeFn = merge,
            cloneFn = clone,
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
    }

    /**
     * Clone simple variables including array, {}-like objects, DOM nodes and Date without keeping the old reference.
     * A reference for the object itself is returned if it's not a direct decendant of Object.
     *
     * @param {Object} item The variable to clone
     * @return {Object} clone
     */
    function clone(item) {
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
                _clone[i] = clone(item[i]);
            }
        }
        // Object
        else if (type === '[object Object]' && item.constructor === Object) {
            _clone = {};

            for (key in item) {
                _clone[key] = clone(item[key]);
            }
        }

        return _clone || item;
    }

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
    function chain(object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    }

//        var ALL_RESERVED_KEYS = merge({}, CLASS_RESERVED_KEYS, CONFIG_RESERVED_KEYS);

    function Base() {
    }


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
     * @param {String} className The class name to create in string dot-namespaced format, for example:
     * 'My.very.awesome.Class', 'FeedViewer.plugin.CoolPager'
     * It is highly recommended to follow this simple convention:
     *  - The root and the class name are 'CamelCased'
     *  - Everything else is lower-cased
     * Pass `null` to create an anonymous class.
     * @param {Object} data The key - value pairs of properties to apply to this class. Property names can be of any valid
     * strings, except those in the reserved listed below:
     *  - `extend`
     *  - `mixins`
     *  - `inherits`
     *  - `singleton`
     *  - `statics`
     *
     * @param {Function} createdFn Optional callback to execute after the class is created, the execution scope of which
     * (`this`) will be the newly created class itself.
     * @return {Object}
     * @member exo
     */
    function define(className, data) {
        var hasClassName = isString(className);
        if (!data) data = (hasClassName ? {} : className) || {};

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
        return extend(Parent, data);
    }

    function makeCtor(parent) {
        if (parent.constructor === Object) {
            return function () {
            };
        } else {
            return ofwrap(parent.constructor);
        }
    }

    function ofwrap(fn, argsize) {
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
            case 5:
                wrapper = function (a1, a2, a3, a4, a5) {
                    fn.call(this, a1, a2, a3, a4, a5);
                };
                break;
            case 6:
                wrapper = function (a1, a2, a3, a4, a5, a6) {
                    fn.call(this, a1, a2, a3, a4, a5, a6);
                };
                break;
            case 7:
                wrapper = function (a1, a2, a3, a4, a5, a6, a7) {
                    fn.call(this, a1, a2, a3, a4, a5, a6, a7);
                };
                break;
            case 8:
                wrapper = function (a1, a2, a3, a4, a5, a6, a7, a8) {
                    fn.call(this, a1, a2, a3, a4, a5, a6, a7, a8);
                };
                break;
            default:
                wrapper = function () {
                    fn.apply(this, arguments);
                };
        }
        return wrapper;
    }

    /**
     * Same as `define`, but first argument should be the super class and ignore `extend` property in `data`.
     * @param {Object|null} parentClass
     * @param {Object} data
     * @returns {Object}
     */
    function extend(parentClass, data) {
        if (!data) {
            data = parentClass;
            parentClass = Base;
        }
        var parent = parentClass.prototype,
            prototype = chain(parent),
            body = (isFunction(data) ? data.call(prototype, parent, parentClass) : data) || {},
            cls;

        if (isFunction(body)) {
            cls = body;
        } else if (body.constructor !== Object) {
            cls = body.constructor;
        } else {
            cls = makeCtor(parent);
        }

        prototype.constructor = cls;
        cls.prototype = prototype;

        // the '$super' property of class refers to its super prototype
        cls.$super = parent;
        // the '$superclass' property of class refers to its super class
        cls.$superclass = parentClass;

        if (typeof body === 'object') {
            _extend(cls, body, prototype);
            if (body.singleton) {
                cls = new cls();
            }
        }

        return cls;
    }

    function _extend(targetClass, data, targetPrototype) {
        var prototype = targetPrototype || targetClass.prototype,
            _statics = data.statics,
            _mixins = data.mixins,
            _inherits = data.inherits;

        if (_statics) {
            // copy static properties from statics to class
            apply(targetClass, _statics);
        }
        if (_mixins) {
            mixins(targetClass, _mixins, targetPrototype)
        }
        if (_inherits) {
            inherits(targetClass, _inherits, targetPrototype);
        }

        apply(prototype, data, CONFIG_RESERVED_KEYS);

        if (data.toString !== Object.prototype.toString) {
            prototype.toString = data.toString;
        }
    }

    /**
     *
     * @param targetClass
     * @param inherits
     * @param targetPrototype
     */
    function inherits(targetClass, inherits, targetPrototype) {
        var i, ln;

        if (!targetPrototype) {
            targetPrototype = targetClass.prototype;
        }

        if (inherits instanceof Array) {
            for (i = 0, ln = inherits.length; i < ln; i++) {
                _mixin(targetClass, null, inherits[i], targetPrototype);
            }
        }
        else {
            for (var mixinName in inherits) {
                if (inherits.hasOwnProperty(mixinName)) {
                    _mixin(targetClass, null, inherits[mixinName], targetPrototype);
                }
            }
        }
    }

    /**
     *
     * @param targetClass
     * @param mixins
     * @param targetPrototype
     */
    function mixins(targetClass, mixins, targetPrototype) {
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

                _mixin(targetClass, name, item, targetPrototype);
            }
        }
        else {
            for (var mixinName in mixins) {
                if (mixins.hasOwnProperty(mixinName)) {
                    _mixin(targetClass, mixinName, mixins[mixinName], targetPrototype);
                }
            }
        }
    }

    function _mixin(target, name, mixinClass, targetPrototype) {
        var mixin = mixinClass.prototype,
            prototype = targetPrototype || target.prototype,
            key;

        if (name) {
            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = chain(prototype.mixins);
                }
                else {
                    prototype.mixins = {};
                }
            }
        }

        for (key in mixin) {
            if (name && (key === 'mixins')) {
                merge(prototype.mixins, mixin[key]);
            }
            else if (typeof prototype[key] == 'undefined' && key != 'mixinId') {
                prototype[key] = mixin[key];
            }
        }
        if (name) {
            prototype.mixins[name] = mixin;
        }
    }


    /* Initialization */
    exo = {
        version: version,
        define: define,
        extend: extend,
        mixins: mixins,
        inherits: inherits,
        apply: apply,
        applyIf: applyIf,
        clone: clone,
        merge: merge,
        chain: chain
    };

    if (typeof module !== "undefined" && module.exports) {    // NodeJS/CommonJS
        module.exports = exo;
    } else {
        _exo = ctx.exo;
        ctx.exo = exo;
        exo.noConflict = function () {    // no conflict
            ctx.exo = _exo;
            return exo;
        };
    }
})(this, "0.0.1");