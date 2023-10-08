#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const scriptsDir = path.join(__dirname, "scripts");
const MAX_64_BIT = 18446744073709551615n;
const packages = [
  "sum",
  "subtract",
  "multiply",
  "divide",
  "xor",
  "and",
  "or",
  "left_shift",
  "right_shift",
  "bitwise_not",
  "less_than",
  "less_than_or_equal",
  "greater_than",
  "greater_than_or_equal",
  "equals",
  "not_equals",
];

async function main() {
  while (true) {
    ensureDirectoryStructure();

    await Promise.all([
      generateSum(),
      generateSubtract(),
      generateMultiply(),
      generateDivide(),
      generateXor(),
      generateAnd(),
      generateOr(),
      generateLeftShift(),
      generateRightShift(),
      generateBitwiseNot(),
      generateLessThan(),
      generateLessThanOrEqual(),
      generateGreaterThan(),
      generateGreaterThanOrEqual(),
      generateEquals(),
      generateNotEquals(),
    ]);

    try {
      await Promise.all(
        packages.map(async (package) => await execTest(package))
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

function generateProver(projectName, values) {
  const proverToml = Object.keys(values).reduce((acc, name) => {
    return acc + `${name}="${values[name]}"\n`;
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
    const command = spawn("nargo", ["execute", `--package`, package], {
      cwd: scriptsDir,
    });
    let output = "";

    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    command.stderr.on("data", (data) => {
      output += data.toString();
    });

    command.on("close", (code) => {
      if (code === 0) {
        resolve("Proving succeeded");
      } else if (code === 1) {
        console.error(output);
        reject(`Proving failed`);
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
