# grunt-cxsvg

> The cx svg optimizer.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cxsvg --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cxsvg');
```

## The "cxsvg" task
//npm publish ./
### Overview
In your project's Gruntfile, add a section named `cxsvg` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cxsvg: {
    options: {
      // Task-specific options go here.
    },
    wj:{
        prefix:'i-',
        files:{ 'assets/icons/wjicons.svg': ['assets/svgs/wj/*.svg']}
    },
    your_target: {
      // Target-specific file lists and/or options go here.

    },
  },
});
```

### Options

#### options.dir
Type: `String`
Default value: `'assets/svg/  '`

A string value that is the svg asset folder contaiing the original svg files.

#### options.outputFile
Type: `String`
Default value: `'wjicons.svg'`

A string value that is the name of the file to store the optimized and concatenated svg files.


## Release History
_(Nothing yet)_
