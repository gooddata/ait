// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

describe('Google Search', function() {
    var AIT = require('../mocha');

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

            var results = AIT.$("h3 a").wait(1000);
            this.set('results', results);
            return results;
        }
    });

    before(function(done) {
        var that = this;
        // Callback runs in AIT context
        AIT.before(function() {
            that.timeout(100000);
            done();
        });
    });

    after(AIT.after);

    it('should find GoodData references', function() {
        var results = Search.create({ query: 'GoodData' }).execute();
        if (results.length < 5) throw "GoodData not found!";
    });
});
