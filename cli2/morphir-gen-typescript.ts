#!/usr/bin/env node

//NPM imports
import path from 'path';
import {Command} from 'commander'
import cli from './cli'

// Command Description and Options
const program = new Command()
program
    .name('morphir gen typescript')
    .description('Generate TypeScript from the Morphir IR')
    .option('-t, --target <type>', 'Language to Generate.', 'TypeScript')
    .parse(process.argv)

const worker = require("./../Morphir.Elm.CLI").Elm.Morphir.Elm.CLI.init();


require('log-timestamp')

interface CommandOptions {
  targetVersion: string;
  includeCodecs: boolean;
  limitToModules: string;
  generateTestGeneric: boolean;
  generateTestScalatest: boolean;
}

const generate = async (
    options: CommandOptions,
    ir: string,
    testSuite: Array<object>
  ): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      worker.ports.jsonDecodeError.subscribe((err: any) => {
        reject(err);
      });
      worker.ports.generateResult.subscribe(([err, ok]: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(ok);
        }
      });
  
      worker.ports.generate.send([options, ir, testSuite]);
    });
  };



const gen = async (
    input: string,
    outputPath: string,
    options: CommandOptions
  ) => {
    await cli.fsMakeDir(outputPath, {
      recursive: true,
    });
    const morphirIrJson: Buffer = await cli.fsReadFile(path.resolve(input));

    let morphirTestsJSONContent: Array<object> = [];

    try {
        const bufferContent = await cli.fsReadFile(path.resolve('./morphir-tests.json'))
        morphirTestsJSONContent = JSON.parse(bufferContent.toString())
    } catch (_) {
        console.log("could not read morphir-tests.json, defaulting to an empty test!")
    }

    const generatedFiles: string[] = await generate(
      options,
      JSON.parse(morphirIrJson.toString()),
      morphirTestsJSONContent
    );
  
    const writePromises = generatedFiles.map(
      async ([[dirPath, fileName], content]: any) => {
        const fileDir: string = dirPath.reduce(
          (accum: string, next: string) => path.join(accum, next), 
          outputPath
        );
        const filePath: string = path.join(fileDir, fileName); 
  
        if (await cli.fileExist(filePath)) {
          const existingContent: Buffer = await cli.fsReadFile(filePath);
  
          if (existingContent.toString() !== content) {
            await cli.writeFile(filePath, content);
            console.log(`UPDATE - ${filePath}`);
          }
        } else {
          await cli.fsMakeDir(fileDir, {
            recursive: true,
          });
          await cli.writeFile(filePath, content);
          console.log(`INSERT - ${filePath}`);
        }
      }
    );
    const filesToDelete = await cli.findFilesToDelete(outputPath, generatedFiles);
    const deletePromises = filesToDelete.map(async (fileToDelete: string) => {
      console.log(`DELETE - ${fileToDelete}`);
      return cli.fsUnlinkSync(fileToDelete); 
    });
    cli.copyRedistributables(options, outputPath);
    return Promise.all(writePromises.concat(deletePromises));
  };
  
gen(program.opts().input, path.resolve(program.opts().output), program.opts())
    .then(() =>{
        console.log("Done")
    })
    .catch((err) =>{
        console.log(err)
        process.exit(1)
    })
