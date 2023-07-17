#!/usr/bin/env node

// NPM imports
import { program } from "commander";


// Set up Commander
program
    .name('morphir test')
    .command('run', 'Start Testing all the test cases present in morphir-ir.json')
    .command('coverage', 'Generates report on number of branches in a Morphir IR value and TestCases covered')
    .command('data', "Generate test data for Models (types) in a Morphir IR")
    .parse(process.argv)