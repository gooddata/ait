// Copyright (C) 2013-2013, GoodData(R) Corporation. All rights reserved.

global.window = global; // ember-runtime expects window to be present
require('ember-runtime/node_modules/ember-metal');
require('ember-runtime');

var $, browser;

var PageFragmentMixin = Em.Mixin.create({
    root: 'body',

    $root: function() {
        var sel = this.get('root');

        if ('string' === typeof sel) {
            return $(sel);
        } else {
            var x = $(sel.sel, browser, sel.by);
            x.by = sel.by;
            return x;
        }
    }.property('root').cacheable(),

    $: function(sel, context, by) {
        // no selector, just return the root fragment element
        if (!sel) return this.get('$root');

        // global selector
        if ("string" !== typeof context) {
            return $(sel, context, by);
        } else {
            by = context;
        }

        // context-based find
        return this.get('$root').find(sel, by || 'css selector');
    },

    wait: function(timeout) {
        return this.$().wait(timeout);
    }
});

var PageFragment = Em.Object.extend(PageFragmentMixin);

PageFragment.reopenClass({
    q: function(Clazz, selector, by) {
        if (typeof Clazz === 'string') {
            by = arguments[1];
            selector = arguments[0];
            Clazz = PageFragment;
        }

        return function() {
            return browser.create(Clazz, selector, by);
        }.property();
    },

    exec: function(fn) {
        var fun = fn.toString();
        return function() {
            return browser.safeExecute('('+fun+')();');
        }.property();
    }
});

var PageFragmentArray = Ember.ArrayProxy.extend(PageFragmentMixin, {
    itemClass: PageFragment,

    content: function() {
        // take an actuall Array instance and patch the #eq() method in
        var $a = this.$();
        var a = $a.toArray();
        a.eq = $a.eq.bind($a);
        return a;
    }.property('$root').cacheable(),

    objectAtContent: function(idx) {
        // instantiate the itemClass directly with given $root
        return this.get('itemClass')
                   .create({ $root: this.get('content').eq(idx) });
    }
});

var PageObject = PageFragment.extend({
    url: null,

    execute: function() {
        if (this._executed) return;
        this._executed = true;

        // initially navigate to the URL
        browser.get(this.get('url'));
    }
});

By = Em.Object.extend();
By.reopenClass({
    css: function(Clazz, selector) {
        return PageFragment.q(Clazz, selector);
    },
    xpath: function(Clazz, selector) {
        return PageFragment.q(Clazz, selector, 'xpath');
    }
});

exports.init = function aitFragmentImport(ait) {
    // import
    $ = ait.$;
    browser = ait.browser;
};

exports.exportClasses = function aitFragmentExport(ait) {
    // export
    ait.PageFragment = PageFragment;
    ait.PageFragmentArray = PageFragmentArray;
    ait.PageObject = PageObject;
};
