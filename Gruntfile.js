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

        simplemocha: {
            options: {
                timeout: 100000
            },

            ait: { src: ['test/ait_test.js'] },
            fragment: { src: ['test/fragment_test.js'] }
        }
    });

    grunt.registerTask('fixture_server', ['connect:server:keepalive']);

    // Currently, run fragment test only due to the multiple mocha test files run bug
    grunt.registerTask('test', ['connect', 'simplemocha:fragment']);

    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-connect');
};