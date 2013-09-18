"use strict";

var exo = module.exports = {};

var AUTO_ID = 1000,
    objectPrototype = Object.prototype,
    toString = objectPrototype.toString,
    TemplateClass = function () {
    };

var CONFIG_RESERVED_KEYS_ARRAY = [
        "constructor", "extend", "singleton", "statics", "mixins", "inherits",
        "$extend", "$extends", "$singleton", "$statics", "$mixins", "$inherits"
    ],
    CONFIG_RESERVED_KEYS = {};

CONFIG_RESERVED_KEYS_ARRAY.forEach(function (key) {
    CONFIG_RESERVED_KEYS[key] = 1;
});

function getAutoId(prefiex) {
    return (prefiex ? prefiex.toString() : '') + (++AUTO_ID);
}

function isFunction(value) {
    return value && typeof value === 'function';
}

//function isObject(value) {
//    return value && typeof value === 'object';
//}

function isString(value) {
    return typeof value === 'string';
}

var hasDefineProperty = (function () {
    if (!isFunction(Object.defineProperty)) {
        return false;
    }

    // Avoid IE8 bug
    try {
        Object.defineProperty({}, 'x', {});
    } catch (e) {
        return false;
    }

    return true;
})();

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
exo.apply = apply;
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
exo.applyIf = applyIf;
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

function createProxy(fn, context) {
    return function () {
        return fn.apply(context, arguments);
    };
}

exo.clone = clone;
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

exo.merge = merge;
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

exo.bind = bind;
function bind(fn, context) {
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
}



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
exo.forward = forward;
function forward(from, to, functions) {
    for (var i = 0, len = functions.length; i < len; i++) {
        var method = functions[i];
        from[method] = bind(to[method], to);
    }
}

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

exo.overload = overload;
function overload(fns) {
    function overloaded() {
        var fn = overloaded.__fns[arguments.length];
        if (!fn) {
            var i = Math.min(overloaded.__max, arguments.length + 1);
            while (!(i in overloaded.__fns) && i < overloaded.__max) {
                i++;
            }
            fn = overloaded.__fns[i];
        }
        /*jshint validthis:true */
        return fn.apply(this, arguments);
    }

    overloaded.__fns = [];
    overloaded.__max = 0;
    var fn;
    for (var i = 0; i < fns.length; i++) {
        fn = fns[i];
        overloaded.__fns[fn.length] = fn;
        if (overloaded.__max < fn.length) {
            overloaded.__max = fn.length;
        }
    }
    return overloaded;
}

/**
 * Sets the key of object with the specified value.
 * The property is obfuscated, by not being enumerable, configurable and writable.
 *
 * @param {Object}  obj           The object
 * @param {String}  key           The key
 * @param {Mixed}   value         The value
 * @param {Boolean} [isWritable]  True to be writable, false otherwise (defaults to false)
 * @param {Boolean} [isDeletable] True to be deletable, false otherwise (defaults to false)
 */
exo.obfuscateProperty = obfuscateProperty;
function obfuscateProperty(obj, key, value, isWritable, isDeletable) {
    if (hasDefineProperty) {
        Object.defineProperty(obj, key, {
            value: value,
            configurable: isDeletable || false,
            writable: isWritable || false,
            enumerable: false
        });
    } else {
        obj[key] = value;
    }
}

exo.chain = chain;
function chain(object) {
    TemplateClass.prototype = object;
    var result = new TemplateClass();
    TemplateClass.prototype = null;
    return result;
}

exo.define = define;
function define(className, data) {
    var hasClassName = isString(className);
    if (!data) {
        data = (hasClassName ? {} : className) || {};
    }

    if (hasClassName) {
        data.$classname = className;
    }

    var parentClass = data.$extends || data.$extend || data.extend;
    if (isString(parentClass) && isFunction(exo.resolve)) {
        parentClass = exo.resolve(parentClass);
    }
    if (!isFunction(parentClass)) {
        parentClass = Base;
    }
    var cls = extend(parentClass, data);

    if (hasClassName && isFunction(exo.ns) && isFunction(exo.resolve)) {
        var ns, c;
        var i = className.lastIndexOf('.');
        ns = i >= 0 ? className.substring(0, i) : null;
        c = i >= 0 ? className.substring(i + 1) : className;
        if (ns) {
            ns(ns);
        }
        exo.resolve(ns)[c] = cls;
    }

    return cls;
}

exo.extend = extend;
function extend(parentClass, data) {
    if (!data) {
        data = parentClass;
        parentClass = Base;
    }
    var parent = parentClass.prototype,
        prototype = chain(parent),
        params = (isFunction(data) ? data.call(prototype, parent, parentClass) : data) || {},
        Clazz;

    if (isFunction(params)) {
        Clazz = params;
    } else if (params.constructor !== Object) {
        Clazz = params.constructor;
    } else {
        Clazz = makeCtor(parent);
    }

    prototype.constructor = Clazz;
    Clazz.prototype = prototype;

    // the '$super' property of class refers to its super prototype
    obfuscateProperty(Clazz, '$super', parent);
    // the '$superclass' property of class refers to its super class
    obfuscateProperty(Clazz, '$superclass', parentClass);

    if (typeof params === 'object') {

        params.$singleton = params.$singleton || params.singleton;
        params.$statics = params.$statics || params.statics;
        params.$mixins = params.$mixins || params.mixins;
        params.$inherits = params.$inherits || params.inherits;

        __extend(Clazz, params, prototype);
        if (params.$singleton) {
            Clazz = new Clazz();
        }
    }

    return Clazz;
}

function __extend(targetClass, data, targetPrototype) {
    var prototype = targetPrototype || targetClass.prototype,
        _statics = data.$statics,
        _mixins = data.$mixins,
        _inherits = data.$inherits;

    if (_statics) {
        // copy static properties from statics to class
        apply(targetClass, _statics);
    }
    if (_mixins) {
        mixins(targetClass, _mixins, targetPrototype);
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
 * @param {Object} targetClass the target class
 * @param {Object|Array} inherits the classes inherits from
 * @param targetPrototype
 */
exo.inherits = inherits;
function inherits(targetClass, inherits, targetPrototype) {
    var i, ln;

    if (!targetPrototype) {
        targetPrototype = targetClass.prototype;
    }

    if (Array.isArray(inherits)) {
        for (i = 0, ln = inherits.length; i < ln; i++) {
            __mixin(targetClass, null, inherits[i], targetPrototype);
        }
    }
    else {
        __mixin(targetClass, null, inherits, targetPrototype);
    }
}

/**
 *
 * @param targetClass
 * @param mixins
 * @param targetPrototype
 */
exo.mixins = mixins;
function mixins(targetClass, mixins, targetPrototype) {
    var name, item, i, ln;

    if (!targetPrototype) {
        targetPrototype = targetClass.prototype;
    }

    if (Array.isArray(mixins)) {
        for (i = 0, ln = mixins.length; i < ln; i++) {
            item = mixins[i];
            name = item.prototype.$mixinId || item.$mixinId;
            if (!name) {
                name = item.$mixinId = getAutoId('__mixin__');
            }

            __mixin(targetClass, name, item, targetPrototype);
        }
    }
    else {
        for (var mixinName in mixins) {
            if (mixins.hasOwnProperty(mixinName)) {
                __mixin(targetClass, mixinName, mixins[mixinName], targetPrototype);
            }
        }
    }
}

function __mixin(target, name, mixinClass, targetPrototype) {
    var mixin = mixinClass.prototype,
        prototype = targetPrototype || target.prototype,
        key;

    if (name) {
        if (!prototype.hasOwnProperty('$mixins')) {
            if ('$mixins' in prototype) {
                prototype.$mixins = chain(prototype.$mixins);
            }
            else {
                prototype.$mixins = {};
            }
        }
    }

    for (key in mixin) {
        if (name && (key === '$mixins')) {
            merge(prototype.$mixins, mixin[key]);
        }
        else if (typeof prototype[key] === 'undefined' && key !== '$mixinId') {
            prototype[key] = mixin[key];
        }
    }
    if (name) {
        prototype.$mixins[name] = mixin;
    }
}

