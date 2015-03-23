'use strict';

module.exports = function(grunt) {
    
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: ['Gruntfile.js']
            },
            js: {
                src: ['index.js']
            },
            test: {
                src: ['test/yodlee.spec.js']
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    coverageFolder: 'test/coverage',
                    mask: '*.spec.js'
                }
            },
            coveralls: {
                src: ['test/*.spec.js'],
                options: {
                    coverage: true,
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: './',
                    reportFormats: ['cobertura', 'lcovonly']
                }
            }
        },
        mochacli: {
            options: {
                reporter: 'spec',
                bail: true
            },
            all: ['test/*.spec.js']
        },
        jsdoc: {
            dist: {
                src: ['*.js'],
                options: {
                    destination: 'docs'
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            js: {
                files: '<%= jshint.js.src %>',
                tasks: ['jshint:js', 'mochacli']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'mochacli']
            }
        },
        release: {
            options: {
                npm: false
            }
        },
        coveralls: {
            options: {
                src: 'test/coverage/lcov.info'
            },
        },
    });

    grunt.event.on('coverage', function(lcov, done) {        
        require('coveralls').handleInput(lcov, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask('default', ['jshint', 'mochacli', 'mocha_istanbul:coveralls']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
    grunt.registerTask('docs', ['jsdoc']);

};