/*global module, require*/
module.exports = function (grunt) {
  'use strict';

  var globalConfig = {
    docs: 'node_modules/bagel-core/docs',
    mockups: 'mockups',
    protoguide: 'node_modules/bagel-core/guide',
    prototype: 'node_modules/bagel-core/chrome',
    styleguide: 'guide',
    src: 'node_modules/bagel-core/src',
    style: 'chrome',
    dist: {
      root: 'css',
      docs: 'css/docs',
      mockups: 'css/mockups',
      style: 'css'
    }
  };

  grunt.initConfig({
    globalConfig: globalConfig,
    pkg: grunt.file.readJSON('./package.json'),
    assemble : {
      docs: {
        options: {
          assets: '<%= globalConfig.docs  %>/assets',
          flatten: false,
          partials: ['<%= globalConfig.docs  %>/partials/*.hbs'],
          layout: 'default.hbs',
          layoutdir: '<%= globalConfig.docs  %>/layouts/',
          data: ['<%= globalConfig.docs  %>/data/*.{json,yml}']
        },
        files: [{
          expand: true,
          cwd: '.tmp/docs',
          src: ['**/*.hbs'],
          dest: '<%= globalConfig.dist.docs  %>'
        },
        {
          expand: true,
          src: ['node_modules/bagel-core/**/node_modules/bagel-*/guide/**/*.hbs'],
          flatten: true,
          dest: '<%= globalConfig.dist.docs  %>'
        }]
      }
    },
    shared_config: {
      style: {
        options: {
          name: "defaultConfig",
          cssFormat: "dash",
          useSassMaps: true
        },
        src: ['node_modules/**/bagel-*/config.yml', 'node_modules/bagel-*/config.yml', 'config.yml'], // order matters,
        dest: [
          "config.scss"
        ]
      }
    },
    sass: {
      options: {
        loadPath: ['./', 'node_modules/']
      },
      dist: {
        files : {
          '<%= globalConfig.dist.style  %>/style.css': 'init.scss'
        }
      },
      styleguide: {
        files : {
          '<%= globalConfig.dist.docs  %>/stylesheets/styleguide.css': '<%= globalConfig.styleguide  %>/guide.scss'
        }
      },
    },
    myth: {
      options: {
        sourcemap: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= globalConfig.dist.style  %>/',
            src: ['*.css', '**/*.css'],
            dest: '<%= globalConfig.dist.style  %>/'
          }
        ]
      },
      docs: {
        files: [
          {
            expand: true,
            cwd: '<%= globalConfig.dist.docs  %>/',
            src: ['**/*.css'],
            dest: '<%= globalConfig.dist.docs  %>/'
          }
        ]
      }
    },
    clean: {
      dist: {
        files: [
        {
          dot: true,
          src: ['<%= globalConfig.dist.root  %>/*']
        }
        ]
      },
      docs: {
        files : [
        {
          dot: true,
          src: ['<%= globalConfig.dist.docs  %>/*']
        }
        ]
      },
      tempdocs: {
        files : [{
          dot: true,
          src: ['.tmp/docs*']
        }]
      }
    },
    copy: {
      dist: {
        files: [
        {
          expand: true,
          flatten: true,
          cwd: '<%= globalConfig.src  %>/',
          src: ['**/*.js'],
          dest: '<%= globalConfig.dist.style  %>/javascripts/'
        },
        {
          expand: true,
          cwd: '<%= globalConfig.src  %>/assets',
          src: ['**/*'],
          dest: '<%= globalConfig.dist.style  %>/assets/'
        }
        ]
      },
      docs: {
        files: [
        {
          expand: true,
          cwd: '<%= globalConfig.docs  %>/assets/',
          src: ['images/*', 'javascripts/**/*.js', 'stylesheets/*.css'],
          dest: '<%= globalConfig.dist.docs  %>'
        }
        ]
      },
      tempdocs: {
        files: [
        {
          expand: true,
          cwd: '<%= globalConfig.protoguide  %>',
          src: ['**/*.hbs'],
          dest: '.tmp/docs'
        },
        {
          expand: true,
          cwd: '<%= globalConfig.styleguide  %>',
          src: ['**/*.hbs'],
          dest: '.tmp/docs'
        }]
      }
    },
    watch: {
      hbs: {
        files: ['<%= globalConfig.docs  %>/**/*.hbs'],
        tasks: ['assemble:docs']
      },
      docs: {
        files: ['<%= globalConfig.docs  %>/src/assets/images/*', '<%= globalConfig.docs  %>/src/assets/javascripts/*'],
        tasks: ['copy:docs']
      },
      docsass: {
        files: ['<%= globalConfig.docs  %>/src/assets/stylesheets/*'],
        tasks: ['doccss']
      },
      sass: {
        files: ['<%= globalConfig.src  %>/**/*.scss', '<%= globalConfig.style  %>/**/*.scss'],
        tasks: ['distcss', 'copy:docs', 'doccss']
      },
      js: {
        files: ['<%= globalConfig.src  %>/**/*.js'],
        tasks: ['copy:dist', 'copy:docs']
      }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: '<%= globalConfig.dist.style  %>/stylesheets/',
        src: ['*.css', '!*.min.css'],
        dest: '<%= globalConfig.dist.style  %>/stylesheets/',
        ext: '.min.css'
      }
    }
  });

require('load-grunt-tasks')(grunt);
grunt.loadNpmTasks('assemble');

grunt.registerTask('bagel:dirs',
  'used to create an array of bagel paths for use in sass pathing',
  function(){
    var loadPaths = grunt.file.expand({}, [
      './',
      'chrome/',
      'node_modules/',
      'node_modules/bagel-*/node_modules/',
      'node_modules/**/node_modules/bagel-*/node_modules/'
    ]);
    grunt.log.write(loadPaths.join(", "));
    grunt.config.set('sass.options.loadPath', loadPaths);

  });


grunt.registerTask('default', ['build']);
grunt.registerTask('distcss', ['sass:dist', 'myth:dist']);
grunt.registerTask('doccss', ['sass:styleguide', 'myth:docs']);
grunt.registerTask('docs', ['copy:tempdocs', 'doccss', 'assemble:docs', 'clean:tempdocs']);
grunt.registerTask('dist', ['clean:dist', 'copy:dist', 'distcss', 'cssmin']);
grunt.registerTask('build', ['clean', 'shared_config', 'bagel:dirs', 'dist', 'clean:docs', 'copy:docs', 'doccss', 'docs']);

};
