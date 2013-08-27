// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.

var AIT = require('../mocha.js').init(false);

var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

describe('AIT mocha support', function() {
    describe('AIT.before', function() {
        before(function(done) {
            this.initSpy = sinon.spy(AIT, 'init').withArgs(sinon.match.func);

            AIT.before(function() {
                done();
            });
        });

        after(AIT.after);

        it('should call AIT.init and pass it the before callback', function() {
            expect(this.initSpy).was.calledOnce();
        });
    });

    describe('AIT.after', function() {
        before(function(done) {
            var afterCallback = function() {
                done();
            };

            this.afterCallbackSpy = sinon.spy(afterCallback);
            AIT.after(this.afterCallbackSpy);
        });


        it('should call AIT.destroy', function() {
            expect(this.afterCallbackSpy).was.calledOnce();
        });
    });

    describe('AIT.wrap', function() {
        describe('function without done callback', function() {
            it('should create a new function that runs done callback in the end', function() {
                var cbkSpy = sinon.spy();
                var wrapped =  AIT.wrap(function() {});
                wrapped(cbkSpy);

                expect(cbkSpy).was.called();
            });
        });

        describe('function with done callback', function() {
            it('should make sure done callback is correctly passed down to wrapped function', function() {
                var done = sinon.spy();
                var wrapped =  AIT.wrap(function(done) {
                    done();
                });

                wrapped(done);

                expect(done).was.called();
            });
        });
    });
});
