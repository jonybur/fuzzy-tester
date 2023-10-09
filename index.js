#!/usr/bin/env node

const { ensureDirectoryStructure, writeResults } = require("./src/files");
const { callNargo } = require("./src/nargo");
const { PACKAGES } = require("./src/constants");

let override;
let errors = [];

function handleFlags() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i += 2) {
    flags[args[i]] = args[i + 1];
  }
  const project = flags["--project"];
  if (!project) return;
  override = {};
  override.project = project;
  delete flags["--project"];
  Object.keys(flags).forEach((flag) => {
    override[flag.substring(2)] = flags[flag];
  });
}

async function runAll() {
  while (true) {
    ensureDirectoryStructure();

    let baselineResults;

    let packages = PACKAGES;

    // generate baseline & provers
    baselineResults = packages.map((package) => package.generator());

    // run tests
    await Promise.all(
      packages.map(async (package, index) => {
        const baselineResult = baselineResults[index].toString();
        await executeTest(package.name, baselineResult);
      })
    );

    writeResults(errors);
  }
}

async function runSingle() {
  const filteredPackages = PACKAGES.filter(
    (package) => package.name === override.project
  );

  if (filteredPackages.length === 0) {
    throw new Error(`${override.project} not found`);
  }

  const package = filteredPackages[0];

  delete override.project;

  // generate baseline & prover
  const baselineResult = package.generator(override).toString();

  // run test
  await executeTest(package.name, baselineResult);

  writeResults(errors);
}

async function executeTest(packageName, baselineResult) {
  try {
    const testOutput = await callNargo(packageName);
    if (testOutput.includes("Circuit witness successfully solved")) {
      console.log(`${packageName} success`);
    } else {
      console.log(`${packageName} failure`);
      errors.push({
        packageName,
        testOutput,
        baselineResult,
      });
    }
  } catch (error) {
    console.log(`${packageName} failure`);
    errors.push({
      packageName,
      error,
      baselineResult,
    });
  }
}

handleFlags();
override ? runSingle() : runAll();
