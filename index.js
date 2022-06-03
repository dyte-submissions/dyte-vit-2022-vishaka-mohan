#!/usr/bin/env node

const cli = require("commander");
const update = require("./update.js");

cli.description("Read csv file and update given dependency in all repos in it");
cli.name("update-deps");
cli.usage("<command>");
cli.addHelpCommand(false);
cli.helpOption(false);

//cli.parse(process.argv);




cli
  .command("update")
  .argument("[arg]", "Dependency and its version that you'd like to check.")
  .option("-u, --update", "Create pull request to update dependency version.")
  .description(
    "Read csv file, check if given dependecy version is up to date and update it in all outdated repos in the file. "
  )
  .action(update);

cli.parse(process.argv);