// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('./ait.js');

/**
 * mocha it() wrap() method
 *
 * Allows the user to write tests as follows:
 *
 * it('click button', wrap(function() { $('button').click(); }));
*/
var Fiber = require('fibers');

function aitWrap(fn) {
    var f = fn;

    function runFn(context, done) {
        Fiber(function() {
            // inject out browser instance into the wrap() method functor
            Fiber.current.browser = AIT.browser;
            f.apply(context, [done]);
        }).run();
    }

    // wrap the sync code into an async method
    f = function(done) {
        fn.call(this);
        done();
    };
    return function(done) { runFn(this, done); };
}

AIT.wrap = aitWrap;

AIT.before = function aitBefore(callback) {
    AIT._ait_beforeCalled = true;

    AIT.init(callback);
};


AIT.after = function aitAfter(callback) {
    Fiber(function() {
        AIT.destroy(callback);
    }).run();
};

var originalBeforeEach = global.beforeEach;
var wrappedBeforeEach = function(fn) {
    originalBeforeEach.call(this, AIT.wrap(fn));
};

var originalAfterEach = global.afterEach;
var wrappedAfterEach = function(fn) {
    originalAfterEach.call(this, AIT.wrap(fn));
};

/**
 *  Wrap the mocha it() calls automatically.
 */
var originalIt = global.it;
var wrappedIt = function(desc, fn) {
    originalIt.call(this, desc, AIT.wrap(function () {
        if (!AIT._ait_beforeCalled) {
            throw new Error('AIT: Be sure to issue before(AIT.before); after(AIT.after); calls in your describe().');
        }

        try {
            fn.apply(this, arguments);
        } catch (ex) {
            if (ex.cause && ex.cause.value && ex.cause.value.message) {
                console.log(ex.cause.value.message);
            }
            AIT.browser.screenshot('ait-error-' + new Date().getTime() + '.png');

            AIT.browser.quit(function() {
                throw ex;
            });
        }
    }));
};

var init = function(wrapMocha) {
    if (wrapMocha !== false) {
        global.beforeEach = wrappedBeforeEach;
        global.afterEach = wrappedAfterEach;
        global.it = wrappedIt;
    }

    return AIT;
};

module.exports = { init: init };
