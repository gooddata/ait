// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.

var path = require('path');

/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 8888,
                    base: 'test/fixtures'
                }
            }
        },

        mochaTest: {
            options: {
                timeout: 100000
            },


            all: { src: ['test/*_test.js'] }
        }
    });

    grunt.registerTask('fixtures_server', ['connect:server:keepalive']);
    grunt.registerTask('test', ['connect', 'mochaTest']);

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
};