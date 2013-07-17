// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('./ait.js');

//
// mocha it() wrap() method
//
// Allows the user to write tests as follows:
//
//   it('click button', wrap(function() { $('button').click(); }));
//
var Fiber = require('fibers');

function aitWrap(fn) {
    var f = fn;

    function runFn() {
        var that = this, finish = arguments[0];

        Fiber(function() {
            // inject out browser instance into the wrap() method functor
            Fiber.current.browser = AIT.browser;
            if (finish) {
                f.apply(that, [finish]);
            } else {
                f.apply(that, []);
            }
        }).run();
    }

    if (fn.toString().match(/^\s*function\s*\(\s*done\s*\)/)) {
        return function(done) { runFn(done); };
    } else {
        // wrap the sync code into an async method
        f = function(done) {
            fn.call(this);
            done();
        };
        return function(done) { runFn(done); };
    }
};


AIT.wrap = aitWrap;

AIT.before = function aitBefore(done) {
    AIT._ait_beforeCalled = true;

    //console.info('before', this.test.parent);
    if (!this.test.parent._afterAll.length) {
        throw new Error('AIT: Be sure to issue before(AIT.before); after(AIT.after); calls in your describe().');
    }

    this.timeout(100000);

    AIT.init(done);
};

AIT.after = AIT.wrap(function aitAfter() {
    AIT.destroy();
});

//
// Wrap the mocha `it()` calls automatically.
//
var i = global.it;
global.it = function(desc, fn) {
    i.call(this, desc, AIT.wrap(function() {
        // console.info('it', this.root, Object.keys(this));
        if (!AIT._ait_beforeCalled) {
            throw new Error('AIT: Be sure to issue before(AIT.before); after(AIT.after); calls in your describe().');
        }

        fn.apply(this, arguments);
    }));
};

module.exports = AIT;
