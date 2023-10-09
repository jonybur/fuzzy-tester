#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let override;
let errors = [];
const SCRIPTS_DIR = path.join(__dirname, "scripts");
const MAX_64_BIT = 18446744073709551615n;
const PACKAGES = [
  { name: "sum", generator: generateSum },
  { name: "multiply", generator: generateMultiply },
  { name: "and", generator: generateAnd },
  { name: "right_shift", generator: generateRightShift },
  { name: "or", generator: generateOr },
  { name: "subtract", generator: generateSubtract },
  { name: "xor", generator: generateXor },
  { name: "not_equals", generator: generateNotEquals },
  { name: "equals", generator: generateEquals },
  { name: "greater_than", generator: generateGreaterThan },
  { name: "greater_than_or_equal", generator: generateGreaterThanOrEqual },
  { name: "less_than_or_equal", generator: generateLessThanOrEqual },
  { name: "less_than", generator: generateLessThan },
  // NOT WORKING:
  // { name: "left_shift", generator: generateLeftShift },
  // { name: "divide", generator: generateDivide },
  // { name: "bitwise_not", generator: generateBitwiseNot },
];

(function () {
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
})();

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

    fs.writeFileSync(`${SCRIPTS_DIR}/results.json`, JSON.stringify(errors));
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

  fs.writeFileSync(`${SCRIPTS_DIR}/results.json`, JSON.stringify(errors));
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

async function callNargo(package) {
  return new Promise((resolve, reject) => {
    let output = "";
    const command = spawn("nargo", ["execute", `--package`, package], {
      cwd: SCRIPTS_DIR,
    });

    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    command.stderr.on("data", (data) => {
      output += data.toString();
    });

    command.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else if (code === 1) {
        reject(output);
      }
    });

    command.on("error", (error) => {
      reject(`Error executing nargo test: ${error}`);
    });
  });
}

function generateXYValues(args) {
  return {
    x:
      args?.["x"] !== undefined
        ? BigInt(args["x"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
    y:
      args?.["y"] !== undefined
        ? BigInt(args["y"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
  };
}

function generateSum(args) {
  const values = generateXYValues(args);
  values.result = values.x + values.y;
  generateProver("sum", values);
  return values.result;
}

function generateSubtract(args) {
  const values = generateXYValues(args);
  values.result = values.x - values.y;
  generateProver("subtract", values);
  return values.result;
}

function generateMultiply(args) {
  const values = generateXYValues(args);
  values.result = values.x * values.y;
  generateProver("multiply", values);
  return values.result;
}

function generateDivide(args) {
  const values = generateXYValues(args);
  values.result = values.x / values.y;
  generateProver("divide", values);
  return values.result;
}

function generateXor(args) {
  const values = generateXYValues(args);
  values.result = values.x ^ values.y;
  generateProver("xor", values);
  return values.result;
}

function generateAnd(args) {
  const values = generateXYValues(args);
  values.result = values.x & values.y;
  generateProver("and", values);
  return values.result;
}

function generateOr(args) {
  const values = generateXYValues(args);
  values.result = values.x | values.y;
  generateProver("or", values);
  return values.result;
}

function generateLessThan(args) {
  const values = generateXYValues(args);
  values.result = values.x < values.y;
  generateProver("less_than", values);
  return values.result;
}

function generateLessThanOrEqual(args) {
  const values = generateXYValues(args);
  values.result = values.x <= values.y;
  generateProver("less_than_or_equal", values);
  return values.result;
}

function generateGreaterThan(args) {
  const values = generateXYValues(args);
  values.result = values.x > values.y;
  generateProver("greater_than", values);
  return values.result;
}

function generateGreaterThanOrEqual(args) {
  const values = generateXYValues(args);
  values.result = values.x >= values.y;
  generateProver("greater_than_or_equal", values);
  return values.result;
}

function generateEquals(args) {
  const values = generateXYValues(args);
  values.result = values.x == values.y;
  generateProver("equals", values);
  return values.result;
}

function generateNotEquals(args) {
  const values = generateXYValues(args);
  values.result = values.x != values.y;
  generateProver("not_equals", values);
  return values.result;
}

function generateLeftShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  const result = x << y;
  generateProver("left_shift", { x, y, result });
  return result;
}

function generateRightShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  const result = x >> y;
  generateProver("right_shift", { x, y, result });
  return result;
}

function generateBitwiseNot() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = ~x;
  generateProver("bitwise_not", { x, result });
  return result;
}

function isNumber(value) {
  return typeof value === "bigint" || typeof value === "number";
}

function generateProver(projectName, values) {
  const proverToml = Object.keys(values).reduce((acc, name) => {
    const value = values[name];
    return acc + `${name}=${isNumber(value) ? `"${value}"` : `${value}`}\n`;
  }, "");
  fs.writeFileSync(
    `${SCRIPTS_DIR}/crates/${projectName}/Prover.toml`,
    proverToml
  );
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR);
    fs.mkdirSync(`${SCRIPTS_DIR}/src`);
  }
}

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}

override ? runSingle() : runAll();
