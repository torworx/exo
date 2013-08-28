(function (root) {
    var _exo;
    var exo = require('../lib/exo');

    exo.ns = function() {
        var ctx, i, len, ns, j, sublen, part;

        for (i = 0, len = arguments.length; i < len; i++) {
            ctx = root;
            ns = arguments[i].split('.');

            for (j = 0, sublen = ns.length; j < sublen; j++) {
                part = ns[j];

                if (!(part in ctx)) {
                    ctx[part] = {};
                }

                ctx = ctx[part];
            }
        }
    };

    exo.resolveClass = function (name) {
        var ns = (name || '').split('.');
        var ctx = root;
        var i, len, part;
        for (i = 0, len = ns.length; i < len; i ++) {
            part = ns[i];
            if (part in ctx) ctx = ctx[part];
            else throw new Error('Can not resolve class: ' + name);
        }
        return ctx;
    };

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