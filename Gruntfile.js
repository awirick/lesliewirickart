/*global module */
/*jshint camelcase:false */
module.exports = function( grunt ) {
	'use strict';

	// global config are the environments options we find
	// needing to set for every site. These are only often changed values.
	// We suggest you consult the entire configuration and ensure
	// it fits your site.
	grunt.initConfig({
		config: require('./config.json'),
		// requries wp-cli (http://wp-cli.org/)
		exec: {
			initWordpress: {
				cwd: "app/",
				cmd: 'wp core download'
			},
			installWordpress: {
				cwd: "app/",
				cmd: function() {
					var config = grunt.config.get('config.wp');
					return 'wp core install' +
					' --url=' + config.url +
					' --title=' + config.title +
					' --admin_password=' + config.admin.password +
					' --admin_user=' + config.admin.user +
					' --admin_email=' + config.admin.email;
				}
			},
			initConfig: {
				cwd: "app/",
				cmd: function() {
					var config = grunt.config.get('config.wp.db');
					return 'wp core config' +
						' --dbname=' + config.name +
						' --dbuser=' + config.user +
						' --dbpass=' + config.pwd +
						' --dbhost=localhost:/opt/boxen/data/mysql/socket';
				}
			},
			initPlugins: {
				cwd: "app/",
				cmd: function() {
					var _ = require('lodash');
					return _(grunt.config.get('config.wp.plugins')).map(
						function(plugin){
							return 'wp plugin install ' + plugin + ' --activate';
						}).join(' && ');
				}
			},
			get_grunt_sitemap: {
        command: 'curl --silent --output sitemap.json http://<%= config.wp.url %>/?show_sitemap'
      }
		},

		watch: {
			reload_config: {
				files: ['<%= config.themeDir  %>/assets/stylesheets/*.yml'],
				tasks: 'compile_config'
			},
			reload_css: {
				files: ['<%= config.themeDir  %>/assets/stylesheets/**/*.scss'],
				tasks: 'compile_css'
			},
			reload_js: {
				files: [
					'<%= config.themeDir  %>/assets/javascripts/src/*.js',
					'<%= config.themeDir  %>/assets/javascripts/*.js',
					'!<%= config.themeDir  %>/assets/javascripts/scripts.js'
				],
				tasks: 'compile_js'
			}
		},

		shared_config: {
      style: {
        options: {
          name: "defaultConfig",
          cssFormat: "dash",
          useSassMaps: true
        },
        src: ['node_modules/**/bagel-*/config.yml', 'node_modules/bagel-*/config.yml', '<%= config.themeDir  %>/assets/stylesheets/config.yml'], // order matters,
        dest: [
          "<%= config.themeDir  %>/assets/stylesheets/config.scss"
        ]
      }
    },

		sass: {
      options: {
        loadPath: []
      },
      dist: {
        files : {
          '<%= config.themeDir  %>/assets/stylesheets/css/style.css': '<%= config.themeDir  %>/assets/stylesheets/init.scss'
        }
      }
    },

		myth: {
      options: {
        sourcemap: true,
				features: {
					fontVariant: false
				}
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.themeDir  %>/assets/stylesheets/',
            src: ['**/*.css'],
            dest: '<%= config.themeDir  %>/assets/stylesheets/'
          }
        ]
      },
		},

		cssmin: {
			dist: {
				expand: true,
				cwd: '<%= config.distThemeDir  %>/assets/stylesheets',
				src: ['*.css', '!*.min.css'],
				dest: '<%= config.distThemeDir  %>/assets/stylesheets',
				ext: '.css'
			}
		},

		uncss: {
      dist: {
        options: {
          ignore: [/open/, /pushed/, /active/, /focus/, /placeholder/, /mfp/],
					stylesheets  : ['assets/stylesheets/css/style.css']
        },
        files: {
          '<%= config.distThemeDir  %>/assets/stylesheets/css/style.css': ['<%= config.distThemeDir  %>/*.php']
        }
      }
    },

		penthouse: {
      home: {
        width: 1200,
        height: 900,
        css: '<%= config.distThemeDir  %>/assets/stylesheets/style.css',
				url: 'http://goodtwin.dev',
				outfile: '<%= config.distThemeDir  %>/views/partials/global/criticalcss.twig',
      }
    },

		imagemin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
						dest: 'dist/'
					}
				]
			}
		},

		jshint: {
			options: {
				jshintrc: true
			},
			files: {
				src: [
					'<%= config.themeDir  %>/assets/javascripts/*.js',
					'!<%= config.themeDir  %>/assets/javascripts/scripts.js',
					'<%= config.themeDir  %>/assets/javascripts/src/*.js'
				]
			}
		},

		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: ['dist/*']
					}
				]
			}
		},

		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'app/',
						src: ['**/*', '!**/*.scss'],
						dest: 'dist/'
					}
				]
			}
		},

		modernizr: {
			devFile : 'remote',
			outputFile : '<%= config.themeDir  %>/views/partials/global/modernizr.twig',
			extra : {
        load : false
      },
			files : ['<%= config.themeDir  %>/assets/javascripts/src/**/*.js', '<%= config.themeDir  %>/assets/stylesheets/**/*.scss']
		},

		requirejs: {
      dev: {
        options: {
          findNestedDependencies: true,
          baseUrl: '<%= config.themeDir  %>/assets/javascripts/',
          optimize: 'none',
          mainConfigFile: '<%= config.themeDir  %>/assets/javascripts/config.js',
          include: ['main'],
          out: '<%= config.themeDir  %>/assets/javascripts/scripts.js',
          onModuleBundleComplete: function (data) {
            var fs = require('fs'),
              amdclean = require('amdclean'),
              outputFile = data.path;

            fs.writeFileSync(outputFile, amdclean.clean({
              'filePath': outputFile
            }));
          }
        }
      },
			dist: {
				options: {
					findNestedDependencies: true,
					baseUrl: '<%= config.distThemeDir  %>/assets/javascripts/',
					optimize: 'uglify2',
					mainConfigFile: '<%= config.distThemeDir  %>/assets/javascripts/config.js',
					include: ['main'],
					out: '<%= config.distThemeDir  %>/assets/javascripts/scripts.js',
					onModuleBundleComplete: function (data) {
						var fs = require('fs'),
							amdclean = require('amdclean'),
							outputFile = data.path;

						fs.writeFileSync(outputFile, amdclean.clean({
							'filePath': outputFile
						}));
					}
				}
			}
    },

		rsync: {
			staging: {
				args: ["--verbose"],
				src: 'dist/',
				dest: '/var/www/<%= config.name  %>',
				host: 'root@cronut.goodtwin.co',
				recursive: true
			},
			prod: {
				args: ["--verbose"],
				src: 'dist/',
				dest: '/var/www/<%= config.name  %>',
				host: '',
				recursive: true
			}
		},

		deployments: {
			options: {
				backup_dir: 'backups'
			},
			local: {
				title: 'Local',
				database: '<%= config.wp.db.name  %>',
				user: '<%= config.wp.db.user  %>',
				pass: '<%= config.wp.db.pwd  %>',
				host: 'localhost:/opt/boxen/data/mysql/socket',
				url: '<%= config.name  %>.<%= config.env.dev  %>'
			},
			staging: {
				title: 'Staging',
				database: '<%= config.name  %>_staging',
				user: '<%= config.wp.db.user  %>',
				pass: '<%= config.wp.db.pwd  %>',
				host: 'localhost',
				url: '<%= config.name  %>.<%= config.env.staging  %>',
				ssh_host: 'root@cronut.goodtwin.co'
			},
			prod: {
				title: 'Production',
				database: '<%= config.name  %>_prod',
				user: '<%= config.wp.db.user  %>',
				pass: '<%= config.wp.db.pwd  %>',
				host: 'localhost',
				url: 'goodtwin.co',
				ssh_host: ''
			}
		}
	});

	var target = grunt.option('target') || 'staging';

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('bagel:dirs',
  'used to create an array of bagel paths for use in sass pathing',
  function(){
    var loadPaths = grunt.file.expand({}, [
      './',
      'app/wp-content/themes/goodpress/assets/stylesheets/',
			'app/wp-content/themes/goodpress/assets/stylesheets/chrome/',
      'node_modules/',
      'node_modules/bagel-*/node_modules/',
      'node_modules/**/node_modules/bagel-*/node_modules/'
    ]);
    grunt.log.write(loadPaths.join(", "));
    grunt.config.set('sass.options.loadPath', loadPaths);

  });

	grunt.registerTask('load_sitemap_json', function() {
		var sitemap_urls = grunt.file.readJSON('./sitemap.json');
		grunt.config.set('uncss.dist.options.urls', sitemap_urls);
	});

	grunt.registerTask('init', ['exec:initWordpress', 'exec:initConfig', 'exec:installWordpress', 'exec:initPlugins']);
	grunt.registerTask('default', ['pr']);
	grunt.registerTask('compile_config', ['shared_config']);
	grunt.registerTask('compile_css', ['bagel:dirs', 'sass:dist', 'myth:dist']);
	grunt.registerTask('compile_js', ['jshint', 'requirejs:dev']);
	grunt.registerTask('pr', ['compile_config', 'compile_css', 'compile_js']);
	grunt.registerTask('wp_uncss', ['exec:get_grunt_sitemap','load_sitemap_json','uncss:dist']);
	grunt.registerTask('build', ['compile_config', 'compile_css', 'clean:dist', 'copy:dist', 'imagemin:dist', 'cssmin:dist' ]);
	grunt.registerTask('prod', ['build', 'sftp-deploy:theme']);
	// DANGER ZONE: Will push the db also. If that's not what you want, just `rsync:*target*`
	// `deploy` requires a `--target=""` flag. (staging, prod). Defaults to staging.
	grunt.registerTask('deploy', ['rsync:'+target, 'db_push']);
	// for a simple local db dump:
  // ```db_pull --target="local"```
};
