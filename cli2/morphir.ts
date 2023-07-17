#!/usr/bin/env node
// NPM imports
import path from 'path'
import {Command} from 'commander'

// Read the package.json of this package
const packageJson = require(path.join(__dirname, '../../package.json'))

// Set up Commander
const program = new Command()
program
    .version(packageJson.version, '-v, --version')
    .command('make', 'Translate Elm sources to Morphir IR')
    .command('develop', 'Start up a web server and expose developer tools through a web UI')
    .command('stats', 'Collect morphir features used in a model into a document')
    .command('dockerize', 'Creates a docker image containing the Morphir IR and Morphir Develop Server')
    .command('test','Shows Test Commands')
    .command('gen','Shows Gen Commands')
    .parse(process.argv)