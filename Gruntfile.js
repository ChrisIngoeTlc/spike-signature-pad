"use strict";

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        env: {
            test: { NODE_ENV: 'test' },
            integration: { NODE_ENV: 'integration' },
            coverage: { NODE_ENV: 'coverage' }
        },
        cafemocha: {
            test: {
                src: 'test/{,**/}*.js',
                options: {
                    ui: 'bdd',
                    reporter: 'spec'
                }
            },
            coverage: {
                src: 'test/{,**/}*.js',
                options: {
                    ui: 'bdd',
                    reporter: 'html-cov',
                    coverage: {
                        output: 'reports/coverage.html'
                    }
                }
            }
        },
        jscoverage: {
            options: {
                inputDirectory: 'app',
                outputDirectory: 'app-coverage'
            }
        },
        jsonlint: {
            src: [ 'config/{,**/}*.json' ]
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'app/{,**/}*.js',
                'test/{,**/}*.js'
            ],
            ci: {
                src: '<%= jshint.all %>',
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'reports/jshint.xml'
                }
            }
        },
        plato: {
            report: {
                options : {
                    jshint : false
                },
                files: {
                    'reports/plato-report': ['app/{,**/}*.js']
                }
            }
        }
    });

    grunt.registerTask('test', [
        'jsonlint',
        'jshint:all',
        'env:test',
        'cafemocha:test'
    ]);

    grunt.registerTask('integration', [
        'jsonlint',
        'jshint:all',
        'env:integration',
        'cafemocha:test'
    ]);

    grunt.registerTask('coverage', [
        'env:coverage',
        'jscoverage',
        'cafemocha:coverage'
    ]);

    grunt.registerTask('reports', [
        'plato',
        'coverage'
    ]);
};
