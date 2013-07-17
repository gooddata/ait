// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var au = require('auquery');

var ait = {
    $: null,
    browser: null
};

// Export PageFragments and friends to be globally accessible
var fragment = require('./lib/fragment.js');
// export Page(Fragment|Object|*) to ait
fragment.exportClasses(ait);

ait.init = function aitInit(options, callback) {
    if (!callback) {
        callback = options;
        options = null;
    }
    options = Em.Object.create(options || {});

    // read the config file
    var path = require('path'),
        fs = require('fs');
    var rcFname = path.resolve(process.env.aitrc || '.aitrc');
    var rc = fs.existsSync(rcFname) && fs.readFileSync(rcFname, 'utf8');
    if (rc) {
        var sandbox = {
            __filename: rcFname,
            __dirname: path.dirname(rcFname),
            // module: aitrc,
            require: require,
            process: process,
            console: console
        };
        var cfg = require('vm').runInNewContext(rc, sandbox, rcFname);
        options.setProperties(cfg);
    }

    if (!options.get('browserName')) {
        options.set('browserName', process.env.browser);
    }

    ait.options = options;

    function cb($, browser){
        var options = ait.options;

        // initialized $ and browser into the global.ait namespace
        ait.$ = $;
        ait.browser = browser;

        // provide unconditional wait() method
        browser.wait = this.wait.bind(this);

        //
        // $().wait(timeout) method addition which calls WD.js: waitForElement()
        //
        var _wait = au.auQuery.fn.wait = function(timeout) {
            if (!this.selector) console.trace('waitFor');

            var context = this.context || browser;
            try {
                context.waitForElement(this.by || 'css selector', this.selector, timeout);
            } catch(e) {
                console.error('Error: wait(', this.selector, this.by, ')', e.stack);
                throw e;
            }
            return this;
        };

        //
        // Patch to mitigate the unmerged
        //   https://github.com/cyrjano/AuQuery/pull/2
        //
        var _init = au.auQuery.fn.init;
        au.auQuery.fn.init = function(selector, context, by,  browser) {
            _init.call(this, selector, context, by,  browser);
            this.by = by || 'css selector';
            return this;
        };
        au.auQuery.fn.init.prototype = _init.prototype;

        // initialize the browser instance
        browser.init({ browserName: options.browserName || 'phantomjs' });

        // convenience aliases
        browser.screenshot = function screenshot(filename) {
            var data = browser.takeScreenshot();

            filename = filename || 'ait-screenshot-' + new Date().getTime() + '.png';
            require('fs').writeFileSync(filename, data, 'base64');
        };

        // Implicit wait timeout defaults to 100s
        browser.implicitWaitTimeout = options.implicitWaitTimeout || 100000;

        // initializing the timeout
        browser.setImplicitWaitTimeout(browser.implicitWaitTimeout);

        browser.create = function(Clazz, selector, by) {
            if (Clazz) { // fragment type, create the fragment
                if (by) {
                    selector = {
                        sel: selector,
                        by: by
                    };
                }

                if (Clazz.create) {
                    return Clazz.create({ root: selector });
                } else {
                    var res = new Clazz({ root: selector });
                    res.browser = browser;
                    return res;
                }
            }
            return selector;
        };

        // use the initialized $ and browser
        fragment.init(ait);

        // mocha expects the first argument to be an Error in its done()
        // async functions
        callback(null, $, browser);
    }

    var b = new au.browser(require('wd').remote());
    b.drive(cb, function(err, res){
        if(!err) return;

        var browser = ait.browser;
        try {
            browser.screenshot('ait-error-' + new Date().getTime() + '.png');
            browser.quit();
        } catch(e) {
            // quietly finalize
        }
        throw err;
    });
};

ait.destroy = function aitDestroy() {
    ait.browser.quit();
};

module.exports = ait;
