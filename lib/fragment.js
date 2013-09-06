// Copyright (C) 2013-2013, GoodData(R) Corporation. All rights reserved.

global.window = global; // ember-runtime expects window to be present
require('ember-runtime/node_modules/ember-metal');
require('ember-runtime');

var $, browser;

var GLOBAL_CONTEXT = 'global';

/**
 * @class PageFragmentMixin
 *
 * PageFragment common methods exposing mainly the `$root` property
 * and `$` method.
 */
var PageFragmentMixin = Em.Mixin.create({
    root: 'body',

    $root: function() {
        var sel = this.get('root');

        if ('string' === typeof sel) {
            return $(sel);
        } else {
            var x = $(sel.sel, sel.context, sel.by);
            x.by = sel.by;
            return x;
        }
    }.property('root').cacheable(),

    $: function(sel, context, by) {
        // no selector, just return the root fragment element
        if (!sel) return this.get('$root');

        // different selector than current root
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
 */
var PageFragment = Em.Object.extend(PageFragmentMixin);

PageFragment.reopenClass({
    /**
     * @function q
     * @param {Object} config Object with following properties:
     *  clazz {Object} class constructor - PageFragment by default
     *  selector {String} css or xpath string
     *  context {Object} scope under which will be the root element found
     *                  i.e. root element of the parent fragment or browser.
     *  by {String} css or xpath
     */
    q: function(config) {
        var clazz = config.clazz || PageFragment;

        return function() {
            var context = null;
            if (config.context === GLOBAL_CONTEXT) {
                context = browser;
            } else {
                // auQuery always returns a list of elements found
                context = this.get('$root')[0];
            }

            return browser.create(clazz, config.selector, context, config.by);
        }.property();
    },

    /**
     * Lets the WebDriver tell the browser to execute the `functor`.
     *
     * @function exec
     * @param {Function} functor The function to be executed inside
     *                   the browser page context.
     */
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
 */
var PageFragmentArray = Ember.ArrayProxy.extend(PageFragmentMixin, {
    /**
     * PageFragment Class representing the array item.
     *
     * @property itemClass
     */
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
 */
var PageObject = PageFragment.extend({
    /**
     * The location to navigate the browser to.
     * @property url
     */
    url: null,

    /**
     * Implement this in the children, since wait is page
     * specific behavior.
     */
    waitForLoaded: Em.K,

    /**
     * Navigate the browser to the `url`.
     * @method execute
     */
    load: function() {
        browser.get(this.get('url'));

        this.waitForLoaded();

        return this;
    }

});

/**
 * Static PageFragment declarators.
 *
 * @class By
 */
By = Em.Object.extend();
By.reopenClass({
    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the CSS selector passed as its root element. The root element search
     * is scoped to the root element of the parent fragment.
     *
     * @function css
     * @parem {PageFragment} Clazz PageFragment subclass to instantiate
     * @parem {String} selector CSS selector string
     */
    css: function(Clazz, selector) {
        return PageFragment.q({
            clazz: Clazz,
            selector: selector
        });
    },

    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the CSS selector passed as its root element. The root element search
     * is unscoped i.e. whole page is searched for root element.
     *
     * @function globalCss
     * @parem {PageFragment} Clazz PageFragment subclass to instantiate
     * @parem {String} selector CSS selector string
     */
    globalCss: function(Clazz, selector) {
        return PageFragment.q({
            clazz: Clazz,
            selector: selector,
            context: GLOBAL_CONTEXT
        });
    },

    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the XPath selector passed as its root element. The root element search
     * is scoped to the root element of the parent fragment.
     *
     * @function xpath
     * @parem {PageFragment} Clazz PageFragment subclass to instantiate
     * @parem {String} selector XPath selector string
     */
    xpath: function(Clazz, selector) {
        return PageFragment.q({
            clazz: Clazz,
            selector: selector,
            by: 'xpath'
        });
    },

    /**
     * Creates a Em.computed which instantiates the Clazz PageFragment
     * with the XPath selector passed as its root element. The root element search
     * is unscoped i.e. whole page is searched for root element.
     *
     * @function xpath
     * @parem {PageFragment} Clazz PageFragment subclass to instantiate
     * @parem {String} selector XPath selector string
     */
    globalXpath: function(Clazz, selector) {
        return PageFragment.q({
            clazz: Clazz,
            selector: selector,
            context: GLOBAL_CONTEXT,
            by: 'xpath'
        });
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
