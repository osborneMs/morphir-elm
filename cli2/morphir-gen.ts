#!/usr/bin/env node

// NPM imports
import { program } from "commander";


// Set up Commander
program
    .name('morphir gen')
    .command('scala', 'Generate Scala code from Morphir IR')
    .command('jsonschema', 'Generate Json Schema from the Morphir IR')
    .command('typespec', "Generate TypeSpec(previously CADL) from the Morphir IR")
    .command('typescript', "Generate Typescript from the Morphir IR")
    .parse(process.argv)
    