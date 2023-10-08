#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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

async function main() {
  let errors = [];

  while (true) {
    ensureDirectoryStructure();

    let baselineResults;

    // generate baseline & provers
    baselineResults = PACKAGES.map((package) => package.generator());

    // run tests
    await Promise.all(
      PACKAGES.map(async (package, index) => {
        const packageName = package.name;
        const baselineResult = baselineResults[index].toString();
        try {
          const testOutput = await execTest(packageName);
          if (testOutput.includes("Circuit witness successfully solved")) {
            console.log(`${packageName} success`);
          } else {
            errors.push({
              packageName,
              testOutput,
              baselineResult,
            });
          }
        } catch (error) {
          errors.push({
            packageName,
            error,
            baselineResult,
          });
        }
      })
    );

    fs.writeFileSync(`${SCRIPTS_DIR}/results.json`, JSON.stringify(errors));
  }
}

function generateSum() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("sum", { x, y });
  return x + y;
}

function generateSubtract() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("subtract", { x, y });
  return x - y;
}

function generateMultiply() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("multiply", { x, y });
  return x * y;
}

function generateDivide() {
  const x = getRandomBigInt(MAX_64_BIT / 15n, MAX_64_BIT / 10n);
  const y = getRandomBigInt(MAX_64_BIT / 15n, MAX_64_BIT / 10n);
  generateProver("divide", { x, y });
  return x / y;
}

function generateXor() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("xor", { x, y });
  return x ^ y;
}

function generateAnd() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("and", { x, y });
  return x & y;
}

function generateOr() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("or", { x, y });
  return x | y;
}

function generateLeftShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  generateProver("left_shift", { x, y });
  return x << y;
}

function generateRightShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  generateProver("right_shift", { x, y });
  return x >> y;
}

function generateBitwiseNot() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("bitwise_not", { x });
  return ~x;
}

function generateLessThan() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("less_than", { x, y });
  return x < y;
}

function generateLessThanOrEqual() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("less_than_or_equal", { x, y });
  return x <= y;
}

function generateGreaterThan() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("greater_than", { x, y });
  return x > y;
}

function generateGreaterThanOrEqual() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("greater_than_or_equal", { x, y });
  return x >= y;
}

function generateEquals() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("equals", { x, y });
  return x == y;
}

function generateNotEquals() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  generateProver("not_equals", { x, y });
  return x != y;
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

async function execTest(package) {
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

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}

main();
