/*global module:false*/
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            src: ["./index.js", "lib/**/*.js", "Gruntfile.js"],
            options: {
                jshintrc: '.jshintrc',
                ignores: []
            }
        },
        simplemocha: {
            all: {
                src: 'test/**/*.test.js'
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint it'
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
                    ' Licensed <%= pkg.license %> */\n'
                //report: 'gzip'
            },
            min: {
                files: {
                    '<%= pkg.name %>.min.js': ['exo.js']
                }
            }
        },

        browserify: {
            'exo': {
                src: ['./browser/exo.js'],
                dest: './exo.js'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'simplemocha', 'browserify:exo', 'uglify:min']);
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
};
