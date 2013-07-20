// Copyright (C) 2013-2013, GoodData(R) Corporation. All rights reserved.

global.window = global; // ember-runtime expects window to be present
require('ember-runtime/node_modules/ember-metal');
require('ember-runtime');

var $, browser;

/**
 * @class PageFragmentMixin
 *
 * PageFragment common methods exposing mainly the `$root` property
 * and `$` method.
 **/
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

/**
 * Abstraction representing a web application component from the AIT POV.
 *
 * @class PageFragment
 **/
var PageFragment = Em.Object.extend(PageFragmentMixin);

PageFragment.reopenClass({
    /**
     * @function q
     **/
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

    /**
     * Lets the WebDriver tell the browser to execute the `functor`.
     *
     * @function exec
     * @param {Function} functor The function to be executed inside
     *                   the browser page context.
     **/
    exec: function(functor) {
        var fun = functor.toString();
        return function() {
            return browser.safeExecute('('+fun+')();');
        }.property();
    }
});

/**
 * Array of PageFragment instances.
 *
 * Ember.ArrayProxy instance of PageFragments.
 *
 * @class PageFragmentArray
 **/
var PageFragmentArray = Ember.ArrayProxy.extend(PageFragmentMixin, {
    /**
     * PageFragment Class representing the array item.
     *
     * @property itemClass
     **/
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

/**
 * Web application page representing PageFragment.
 *
 * It navigates the browser to the `url` upon calling the #execute method.
 *
 * @class PageObject
 **/
var PageObject = PageFragment.extend({
    /**
     * The location to navigate the browser to.
     * @property url
     **/
    url: null,

    /**
     * Navigate the browser to the `url`.
     * @method execute
     **/
    execute: function() {
        if (this._executed) return;
        this._executed = true;

        // initially navigate to the URL
        browser.get(this.get('url'));
    }
});

/**
 * Static PageFragment declarators.
 *
 * @class By
 **/
By = Em.Object.extend();
By.reopenClass({
    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the CSS selector passed as its root element.
     *
     * @function css
     * @parem {PageFragment} Clazz PageFrament subclass to instantiate
     * @parem {String} selector CSS selector string
     **/
    css: function(Clazz, selector) {
        return PageFragment.q(Clazz, selector);
    },

    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the XPath selector passed as its root element.
     *
     * @function xpath
     * @parem {PageFragment} Clazz PageFrament subclass to instantiate
     * @parem {String} selector XPath selector string
     **/
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
