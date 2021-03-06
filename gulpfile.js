'use strict'

const path = require('path')
const gulp = require('gulp')
const gulpfiles = require('gulpfiles')
const rename = require('gulp-rename')
const wrap = require('gulp-wrap')

const streamToPromise = require('gulp-stream-to-promise')

const myPath = {
	temp: './.tmp/',
	src: './src/',
	dest: './dist/',
}
const FILENAME = 'nasa'

const deps = {
	nebpay:   './vendor/nebPay.js',
	// blockies: './vendor/blockies.min.js',
}

const scripts = {
	[FILENAME + '.js']: [
		'./.tmp/nasa-raw.js',
	]
}
// combine external deps
Object.keys(deps).forEach(function (key) {
	scripts[FILENAME + '.js'].unshift(path.join(myPath.temp, key + '.js'))
})

gulp.task('clean', gulpfiles.del({
	glob: path.join(myPath.dest, '*.*'),
}))

gulp.task('deps', function () {
	let tasks = []
	Object.keys(deps).forEach(function (key) {
		const src = deps[key]
		let stream = gulp.src(src)
			.pipe(wrap('*/\n<%= contents %>\n/*'))
			.pipe(wrap({src: path.join(myPath.src, '_wrapper/dep-' + key + '.js')}))
			.pipe(rename(key + '.js'))
			.pipe(gulp.dest(myPath.temp))
		tasks.push(streamToPromise(stream))
	})
	return Promise.all(tasks)
})

gulp.task('js', gulpfiles.concat({
	rules: scripts,
	dest: myPath.dest,
	config: {
		pipes: [
			{
				plugin: 'wrap',
				config: '*/\n<%= contents %>\n/*',
			},
			{
				plugin: 'wrap',
				config: {src: path.join(myPath.src, '_wrapper/dist-global.js')},
			},
			// {
			// 	plugin: 'replace',
			// 	config: [/\/\*\* DEBUG_INFO_START \*\*\//g, '/*'],
			// },
			// {
			// 	plugin: 'replace',
			// 	config: [/\/\*\* DEBUG_INFO_END \*\*\//g, '*/'],
			// },
			{
				plugin: 'uglify',
				rename: FILENAME + '.min.js',
				config: {
					preserveComments: 'some',
				},
			}
		]
	},
}))

gulp.task('dist', gulp.series([
	'clean',
	'deps',
	'js',
]))
gulp.task('default', gulp.series('dist'))
