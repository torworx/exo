var exo = require('../../../');

var Person = exports.Person = exo.define({
    constructor: function (name) {
        this.name = name;
    },
    setAddress: function (country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
});

var ChinaGuy = exports.ChinaGuy = exo.define({
    $extends: Person,
    constructor: function (name) {
        ChinaGuy.$superclass.call(this, name);
    },
    setAddress: function (city, street) {
        ChinaGuy.$super.setAddress.call(this, 'China', city, street);
    }
});

var BeijingLover = exports.BeijingLover = exo.define({
    $extends: ChinaGuy,
    constructor: function(name) {
        BeijingLover.$superclass.call(this, name);
    },
    setAddress: function(street) {
        BeijingLover.$super.setAddress.call(this, 'Beijing', street);
    }
});