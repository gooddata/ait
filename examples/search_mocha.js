// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

describe('Google Search', function() {
    var AIT = require('../mocha').init();

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


        getResults: function() {
            this.get('_query').type(this.get('query'));
            this.get('_submit').click();

            return AIT.$("h3 a");
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
        var search = Search.create({ query: 'GoodData' }).load();
        var results =  search.getResults();

        if (results.length < 5) throw "GoodData not found!";
    });
});
