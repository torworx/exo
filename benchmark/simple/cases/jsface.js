var jsface = require('jsface');

var Person = exports.Person = jsface.Class({
    constructor: function(name) {
        this.name = name;
    },
    setAddress: function(country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
});

var ChinaGuy = exports.ChinaGuy = jsface.Class(Person, {
    constructor: function(name) {
        ChinaGuy.$super.call(this, name);
    },
    setAddress: function(city, street) {
        ChinaGuy.$superp.setAddress.call(this, 'France', city, street);
    }
});

var BeijingLover = exports.BeijingLover = jsface.Class(ChinaGuy, {
    constructor: function(name) {
        BeijingLover.$super.call(this, name);
    },
    setAddress: function(street) {
        BeijingLover.$superp.setAddress.call(this, 'Paris', street);
    }
});