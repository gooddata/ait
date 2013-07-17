Automated Integration Test Framework (AIT)
==========================================

AIT is a JavaScript/Ember.js based Selenium WebDriver interface utilizing testing framework.

Technical Details
-----------------
For familiar DOM referencing it uses [AuQuery](https://github.com/cyrjano/AuQuery) which provides synchronous very jQuery-like interface for the [WD.js](https://github.com/admc/wd) APIs which command the selenium server.

[Ember.js](http://emberjs.com)-runtime is used as a JS framework for class inheritance, computed properties and other elementary stuff.

[Mocha](http://visionmedia.github.io/mocha) is used to drive the test flow. It is configured with long `timeout` for selenium test cases and to `bail` after a failed test as the `it()` calls define the test steps and it doesn't make sense to continue in the flow if a prerequisite step fails.

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


API
---

### By

This helper provides PageFragment static factory calls. These create computed properties in which the PageFragment instance is only instantiated on-demand - upon the first `get` call done.

 *`# By.css(PageFragmentClazz, cssSelector)`

   Instantiates the PageFragmentClazz with the cssSelector as its root.

 *`# By.xpath(PageFragmentClazz, xpathSelector)`

   Instantiates the PageFragmentClazz with the xpathSelector as its root.

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

### PageFragmentArray

An ArrayProxy for typed PageFragment items.

Example from fragments/dashboard.js:

```javascript
var Tabs = PageFragmentArray.extend({ itemClass: Tab });
var Dashboard = PageFragment.extend({
    tabs: By.css(Tabs, '.yui3-dashboardtab'),
});

var tabs = dash.get('tabs');
tabs.get('length');
tabs.objectAt(0).get('title');
```


### PageObject (extends PageFragment)

Page representation which navigates the browser to a particular page `url`

 *`+ url`*

 *`# execute()`*

   Navigates the browser to the `url` configured


### Base Fragments

#### Button

 *`# click()`*

#### Input

 *`# type(text)`*


Mocha Testing
-------------

var AIT = require('ait/mocha');

```javascript
    before(AIT.before);
    after(AIT.after);
```

or if adding more before/after stuff is necessary:

```javascript
    before(function(done) {
        AIT.before(function(done) {
            // init code
            done();
        });
    });

    after(function() {
        AIT.after();

        // destroy code
    });

    it(function() {
        // test code
    });
```

Copyright
---------

Copyright (c) 2013, GoodData Corporation (BSD License)
