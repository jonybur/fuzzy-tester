#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const scriptsDir = path.join(__dirname, "scripts");
const MAX_64_BIT = 18446744073709551615n;
const packages = [
  { name: "sum", generator: generateSum },
  { name: "subtract", generator: generateSubtract },
  { name: "multiply", generator: generateMultiply },
  { name: "xor", generator: generateXor },
  { name: "and", generator: generateAnd },
  { name: "or", generator: generateOr },
  { name: "not_equals", generator: generateNotEquals },
  { name: "equals", generator: generateEquals },
  { name: "greater_than", generator: generateGreaterThan },
  { name: "greater_than_or_equal", generator: generateGreaterThanOrEqual },
  { name: "less_than_or_equal", generator: generateLessThanOrEqual },
  { name: "less_than", generator: generateLessThan },
  { name: "right_shift", generator: generateRightShift },
  /////////////// NOT WORKING
  // { name: "left_shift", generator: generateLeftShift },
  // { name: "divide", generator: generateDivide },
  // { name: "bitwise_not", generator: generateBitwiseNot },
];

async function main() {
  while (true) {
    ensureDirectoryStructure();

    // generate baseline & provers
    await Promise.all(packages.map((package) => package.generator()));

    try {
      // run tests
      await Promise.all(
        packages.map(async (package) => {
          const result = await execTest(package.name);
          console.log(result);
        })
      );
    } catch (e) {
      console.error(e);
    }
  }
}

function generateSum() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x + y;
  generateProver("sum", { x, y, result });
}

function generateSubtract() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x - y;
  generateProver("subtract", { x, y, result });
}

function generateMultiply() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x * y;
  generateProver("multiply", { x, y, result });
}

function generateDivide() {
  const x = getRandomBigInt(MAX_64_BIT / 15n, MAX_64_BIT / 10n);
  const y = getRandomBigInt(MAX_64_BIT / 15n, MAX_64_BIT / 10n);
  const result = x / y;
  generateProver("divide", { x, y, result });
}

function generateXor() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x ^ y;
  generateProver("xor", { x, y, result });
}

function generateAnd() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x & y;
  generateProver("and", { x, y, result });
}

function generateOr() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x | y;
  generateProver("or", { x, y, result });
}

function generateLeftShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  const result = x << y;
  generateProver("left_shift", { x, y, result });
}

function generateRightShift() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = BigInt(Math.floor(Math.random() * 64));
  const result = x >> y;
  generateProver("right_shift", { x, y, result });
}

function generateBitwiseNot() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = ~x;
  generateProver("bitwise_not", { x, result });
}

function generateLessThan() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x < y;
  generateProver("less_than", { x, y, result });
}

function generateLessThanOrEqual() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x <= y;
  generateProver("less_than_or_equal", { x, y, result });
}

function generateGreaterThan() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x > y;
  generateProver("greater_than", { x, y, result });
}

function generateGreaterThanOrEqual() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x >= y;
  generateProver("greater_than_or_equal", { x, y, result });
}

function generateEquals() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x == y;
  generateProver("equals", { x, y, result });
}

function generateNotEquals() {
  const x = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const y = getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n);
  const result = x != y;
  generateProver("not_equals", { x, y, result });
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
    `${scriptsDir}/crates/${projectName}/Prover.toml`,
    proverToml
  );
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir);
    fs.mkdirSync(`${scriptsDir}/src`);
  }
}

async function execTest(package) {
  return new Promise((resolve, reject) => {
    let output = "";
    const command = spawn("nargo", ["execute", `--package`, package], {
      cwd: scriptsDir,
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
