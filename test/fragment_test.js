// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('../mocha.js');

var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

var ListItem = AIT.PageFragment.extend();

var ListItems = AIT.PageFragmentArray.extend({itemClass: ListItem});

var List = AIT.PageFragment.extend({
    _items: By.css(ListItems, 'li'),

    itemsCount: function() {
        return this.get('_items').get('length');
    }.property()
});

before(function(done) {
    AIT.before(function() {
        AIT.browser.get('http://127.0.0.1:8888/list.html');
        done();
    });
});

after(AIT.after);

describe('AIT.Fragment', function() {
    it('should search for inner fragments inside current fragment', function() {
        var list = List.create({
            root: '#list1'
        });

        expect(list.get('itemsCount')).to.eql(2);
    });

    it('should search for elements globaly if told to do so', function() {
        var List = AIT.PageFragment.extend({
            _items: By.globalCss(ListItems, 'li'),

            itemsCount: function() {
                return this.get('_items').get('length');
            }.property()
        });

        var list = List.create({
            root: '#list1'
        });

        expect(list.get('itemsCount')).to.eql(4);
    });
});