#! /usr/bin/env node

const Launcher = require('webdriverio').Launcher

const ExtensionConverter = require('../lib/extension_converter')
const WdioLauncherFactory = require('../lib/wdio_launcher_factory')

const yargs = require('yargs')
  .usage('Usage: $0 [options]')
  .example('extelenium -e extension/ -c wdio.conf.js', 'Launch wdio test runner with chrome extension loaded')
  .option('extension', {
    alias: 'e',
    describe: 'path to extension containing your manifest.json'
  })
  .option('wdio-config', {
    alias: 'c',
    describe: 'path to your wdio.conf.js file'
  })
  .demandOption(['e'], 'please provide extension path')
  .demandOption(['c'], 'please provide wdio.conf.js config path')
  .help()
  .argv


const chromeExtensionPath = yargs.e || yargs.extension
const wdioConfigFilePath = yargs.c || yargs.wdioConfig

const extensionConverter = new ExtensionConverter({chromeExtensionPath})
const wdioLauncherFactory = new WdioLauncherFactory({wdioConfigFilePath})


console.log("running extensionConverter");
extensionConverter
  .toCrxFile()
  .then(extensionConverter.toBase64String)
  .then(convertedExtension => {
    const launcher = wdioLauncherFactory.withExtensionLoaded({
      encodedExtension: convertedExtension
    })
    console.log("about to run launcher.run()");
    console.trace();
    launcher.run().then(code => {
      console.log("JUST did launcher.run()");
      process.exit(code)
      console.log("lksdfjlksdj");
    }, (error) => {
      console.error('Launcher failed to start the test: ', error.stacktrace)
      process.exit(1)
    })
  })
  .then(extensionConverter.cleanCrxAndPemFiles)
