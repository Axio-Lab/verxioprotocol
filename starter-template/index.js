#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

program
  .name('create-verxio-starter')
  .description('Create a new Verxio project with pre-installed dependencies and components')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => {
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your project named?',
          validate: (input) => {
            if (!input) return 'Project name is required';
            if (fs.existsSync(input)) return 'Directory already exists';
            return true;
          },
        },
      ]);
      projectName = name;
    }

    const templateDir = path.join(__dirname, 'template');
    const targetDir = path.join(process.cwd(), projectName);

    console.log(chalk.blue(`Creating new Verxio project in ${targetDir}...`));

    try {
      // Copy template files
      await fs.copy(templateDir, targetDir);

      // Update package.json with project name
      const packageJsonPath = path.join(targetDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      console.log(chalk.green('\nProject created successfully! 🎉'));
      console.log('\nNext steps:');
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan('  pnpm install'));
      console.log(chalk.cyan('  pnpm dev'));
    } catch (err) {
      console.error(chalk.red('Error creating project:'), err);
      process.exit(1);
    }
  });

program.parse(); 