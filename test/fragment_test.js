// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('../mocha.js').init();

var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

describe('AIT.Fragment', function() {
    before(function(done) {
        AIT.before(function() {
            AIT.browser.get('http://127.0.0.1:8888/list.html');
            done();
        });
    });

    after(AIT.after);

    describe('nested page fragments', function() {
        var ParentFragment = AIT.PageFragment.extend({
            root: '#parentFragment',
            childFragment: By.css(AIT.PageFragment, '#childFragment')
        });

        it('nested fragment should have root element derived from the parent fragment', function() {
            var parentFragment = ParentFragment.create();
            var childFragment = parentFragment.get('childFragment');

            var childRoot = childFragment.get('root');
            expect(childRoot).to.be.a(Object);
            expect(childRoot.context).to.be.a(Object);
            expect(childRoot.sel).to.be('#childFragment');
        });
    });

    describe('fragment array creation', function() {
        var ListItem = AIT.PageFragment.extend({
            getStuff: function() {
                var stuff = this.$('.stuff');
                return stuff;
            }
        });

        var ListItems = AIT.PageFragmentArray.extend({itemClass: ListItem});

        var List = AIT.PageFragment.extend({
            items: By.css(ListItems, 'li')
        });

        it('array items should be sought within parent fragment root element by default', function() {
            var list = List.create({
                root: '#list1'
            });

            var items = list.get('items');
            expect(items.get('length')).to.eql(2);

            // Item root should be derived from parent root
            var item = items.objectAt(0);
            var stuff = item.getStuff();

            expect(stuff.get('length')).to.be(2);
        });

        it('array items should be sought globally if told so', function() {
            var List = AIT.PageFragment.extend({
                items: By.globalCss(ListItems, 'li')
            });

            var list = List.create({
                root: '#list1'
            });

            var items = list.get('items');
            expect(items.get('length')).to.eql(4);
        });
    });
});