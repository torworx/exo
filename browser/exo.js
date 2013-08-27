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
})(global);