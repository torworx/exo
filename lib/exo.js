"use strict";

var exo = {},
    AUTO_ID = 1000,
    objectPrototype = Object.prototype,
    toString = objectPrototype.toString,
    TemplateClass = function () {};

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

    chain: function (object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    },

    define: function (className, data) {
        var hasClassName = isString(className);
        if (!data) {
            data = (hasClassName ? {} : className) || {};
        }

        data.$classname = hasClassName ? className : undefined;

        var parentClass = data.$extends || data.$extend || data.extend;
        if (isString(parentClass) && isFunction(exo.resolve)) {
            parentClass = exo.resolve(parentClass);
        }
        if (!isFunction(parentClass)) {
            parentClass = Base;
        }
        var cls = exo.extend(parentClass, data);

        if (hasClassName && isFunction(exo.ns) && isFunction(exo.resolve)) {
            var ns, c;
            var i = className.lastIndexOf('.');
            ns = i >= 0 ? className.substring(0, i) : null;
            c = i >= 0 ? className.substring(i + 1) : className;
            if (ns) { exo.ns(ns); }
            exo.resolve(ns)[c] = cls;
        }

        return cls;
    },

    extend: function (parentClass, data) {
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
            if (body.$singleton || body.singleton) {
                Clazz = new Clazz();
            }
        }

        return Clazz;
    },

    _extend: function (targetClass, data, targetPrototype) {
        var prototype = targetPrototype || targetClass.prototype,
            _statics = data.$statics || data.statics,
            _mixins = data.$mixins || data.mixins,
            _inherits = data.$inherits || data.inherits;

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

        if (Array.isArray(inherits)) {
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

        if (Array.isArray(mixins)) {
            for (i = 0, ln = mixins.length; i < ln; i++) {
                item = mixins[i];
                name = item.prototype.$mixinId || item.$mixinId;
                if (!name) {
                    name = item.$mixinId = getAutoId('__mixin__');
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
            if (!prototype.hasOwnProperty('$mixins')) {
                if ('$mixins' in prototype) {
                    prototype.$mixins = exo.chain(prototype.$mixins);
                }
                else {
                    prototype.$mixins = {};
                }
            }
        }

        for (key in mixin) {
            if (name && (key === '$mixins')) {
                exo.merge(prototype.$mixins, mixin[key]);
            }
            else if (typeof prototype[key] === 'undefined' && key !== '$mixinId') {
                prototype[key] = mixin[key];
            }
        }
        if (name) {
            prototype.$mixins[name] = mixin;
        }
    }
});

/* Initialization */
module.exports = exports = exo;
