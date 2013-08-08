// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('../ait');

AIT.init(function(err, $, browser) {

var Input = AIT.PageFragment.extend({
    type: function(text) {
        this.$().type(text);
    }
});

var Button = AIT.PageFragment.extend({
    click: function() {
        this.$().click();
    }
});

var Search = AIT.PageObject.extend({
    query: '',
    results: null,

    url: 'http://www.bing.com',

    _query:  By.css(Input, '#sb_form_q'),
    _submit: By.css(Button, '#sb_form_go'),

    execute: function() {
        this._super();

        this.get('_query').type(this.get('query'));
        this.get('_submit').wait(100).click();

        var results = $("h3 a").wait(1000);
        this.set('results', results);
        return results;
    },

    // The following gets executed in the selenium driven browser
    res: AIT.PageFragment.exec(function() {
        var results = document.querySelectorAll('h3 a');
        var r = [];
        for (var i = 0; i < results.length; ++i) {
            r.push(results[i].textContent);
        }
        return r;
    })
});


// Using the PageObject and PageFragments
var search = Search.create({ query: 'GoodData' }); // google for

var results = search.execute();

// iterate and use the quQuery abstraction
results.each(function(idx, link) { console.info(''+idx+'. '+link.text() ); });

// on-demand browser executed method
console.info( search.get('res'));

console.info( browser.title() );

AIT.destroy();

});
