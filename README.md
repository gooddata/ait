Automated Integration Test Framework (AIT)
==========================================

AIT is a JavaScript/Ember.js based Selenium WebDriver interface utilizing testing framework.

Technical Details
-----------------
For familiar DOM referencing it uses [AuQuery](https://github.com/cyrjano/AuQuery) which provides synchronous very jQuery-like interface for the [WD.js](https://github.com/admc/wd) APIs which command the selenium server.

[Ember.js](http://emberjs.com)-runtime is used as a JS framework for class inheritance, computed properties and other elementary stuff.

[Mocha](http://visionmedia.github.io/mocha) is used to drive the test flow. It is configured with long `timeout` for selenium test cases and to `bail` after a failed test as the `it()` calls define the test steps and it doesn't make sense to continue in the flow if a prerequisite step fails.

[node-gd](https://github.com/mikesmullin/node-gd) with gd library are used for custom element screenshotting on the page. See [node-gd readme](https://npmjs.org/package/node-gd#readme) for more info.

The framework provides `PageObject, PageFragment and PageFragmentArray` classes of which the concepts come from [Arquillian](http://arquillian.org/blog/2012/09/19/introducting-arquillian-graphene-page-fragments/).


Running
-------

### Using PhantomJS

Run phantomjs in the background (tested with phantomjs 1.9.1, webdriver is supported since 1.8+)

```
phantomjs --webdriver=4444 [--webdriver-loglevel=DEBUG]
```

Run the test suite
```
mocha ./examples/search_mocha.js
```


### Chrome, Firefox

For Google Chrome a running chromedriver is necessary (downloadable from [https://code.google.com/p/chromedriver/downloads/list].

```
if [ browser = 'chrome' ];
    ./chromedriver
fi

wget -nc http://selenium.googlecode.com/files/selenium-server-standalone-2.33.0.jar

java -jar selenium-server-standalone-2.33.0.jar -p 4444 2>&1 | tee server.log
```

The `browser` environment variable can be used as follows (case significant):

```
browser=(chrome|firefox) mocha ./examples/search_mocha.js
```


note: The most reliable Selenium client to date seems to be Firefox.


Configuration
-------------

The `AIT.options` Em.Object instance will be filled in with a result of the `.aitrc` JavaScript configuration file. This is to be placed to the current working directory from which the AIT utilizing script is started. Optionally the `aitrc` environment variable can be used to point to the config file.

Also require() call is supported in order to be able to structure the configuration arbitrarilly. For example:

```
$ cat .aitrc
({
    windowWidth: 1024,
    windowHeight: 768,

    server: "https://secure.gooddata.com",

    gdcUser: "demo@acme.com",

    // load password from the `.aitpass` file
    gdcPass: require(__dirname+'/.aitpass')
})
```

Then accessing the individual variables can be done as follows:

```
console.log( AIT.options.gdcUser );
```


API
---

### By

This helper provides PageFragment static factory calls. These create computed properties in which the
PageFragment instance is only instantiated on-demand - upon the first `get` call done.

 *`# By.css(PageFragmentClazz, cssSelector)`

   Instantiates the PageFragmentClazz with the cssSelector as its root.
   Search for this root element is scoped by parent fragment root element.

 *`# By.globalCss(PageFragmentClazz, cssSelector)`

   Instantiates the PageFragmentClazz with the cssSelector as its root.
   Search for this root element is unscoped.

 *`# By.xpath(PageFragmentClazz, xpathSelector)`

   Instantiates the PageFragmentClazz with the xpathSelector as its root.
   Search for this root element is scoped by parent fragment root element.

 *`# By.xpathGlobal(PageFragmentClazz, xpathSelector)`

   Instantiates the PageFragmentClazz with the xpathSelector as its root.
   Search for this root element is unscoped.

### PageFragment

Provides encapsulation for an arbitrary page fragment aiming to expose logical component APIs for the AuQuery-WD.js-Selenium-Browser controlled tests.

 *`+ root`*

   Selector string

 *`+ $root`*

   auQuery instance for the `root` selector

 *`# $(selector, context, by)`*

   auQuery scoped $() method

 *`# wait(timeout)`*

   Waits for the $root element to be present

 *`.# exec(functor)`*

   Executes the functor body inside the driven browser page.


### PageFragmentArray

An ArrayProxy for typed PageFragment items.

For example:

```javascript
var Tab = PageFragment.extend({
    title: function() {
        return this.$().text();
    }.property(),
});

var Tabs = PageFragmentArray.extend({ itemClass: Tab });

var Dashboard = PageFragment.extend({
    tabs: By.css(Tabs, '.yui3-dashboardtab'),
});

var dash = AIT.browser.create(Dashboard, '.dashboard');
var tabs = dash.get('tabs');
tabs.get('length');
tabs.objectAt(0).get('title');
```

### PageObject (extends PageFragment)

Page representation which navigates the browser to a particular page `url`

 *`+ url`*

 *`# load()`*

    Navigates the browser to the `url` configured and wait till the page is loaded.

 *`# waitForLoaded()`*
    Em.K by default. Implement this method in the child to tell how to wait for page load.


Mocha Testing
-------------

var AIT = require('ait/mocha').init();

```javascript
describe('A Feature', function() {
    before(AIT.before);
    after(AIT.after);

    ...

});
```

or if adding more before/after stuff is necessary:

```javascript
    describe('A Feature', function() {
        before(function(done) {
            AIT.before(function() {
                // init code
                done();
            });
        });

        after(function(done) {
            AIT.after(function() {
                // destroy code
                done();
            });
        });

        it(function() {
            // test code
        });
    });
```

Make sure before and after functions are defined within a describe function.
The reason for this is that in case of multiple test files passed to mocha to run,
all the before methods from all the test files defined before describe functions
are run first before anything else. Similarly, after functions are run when the last
test from the last file is finished. So, to avoid individual tests stepping to each
others setup and teardown nest before functions to describe functions.


AIT Testing
-----------
Unit test are located under test directory.

```
grunt test
```

Stars fixtures server and runs the tests.
If you need to debug the tests you have to start the server first via:

```
grunt fixtures_server
```

Then, you can run mocha in debug mode.

Copyright
---------

Copyright (c) 2013, GoodData Corporation (BSD License)
