#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const scriptsDir = path.join(__dirname, "scripts");

async function main() {
  while (true) {
    ensureDirectoryStructure();

    const max64bit = 18446744073709551615n;
    const valueA = getRandomBigInt(max64bit / 3n, max64bit / 2n);
    const valueB = getRandomBigInt(max64bit / 3n, max64bit / 2n);
    const sumResult = valueA + valueB;
    const subtractResult = valueA - valueB;
    const multiplyResult = valueA * valueB;
    const divideResult = valueA / valueB;
    const xorResult = valueA ^ valueB;
    const andResult = valueA & valueB;
    const orResult = valueA | valueB;
    const leftShiftResult = valueA << BigInt(Number(valueB) % 64);
    const rightShiftResult = valueA >> BigInt(Number(valueB) % 64);
    const bitwiseNotResult = ~valueA;
    const lessThanResult = valueA < valueB;
    const lessThanOrEqualResult = valueA <= valueB;
    const greaterThanResult = valueA > valueB;
    const greaterThanOrEqualResult = valueA >= valueB;
    const equalsResult = valueA === valueB;
    const notEqualsResult = valueA !== valueB;

    generateProver({
      valueA,
      valueB,
      sumResult,
      subtractResult,
      multiplyResult,
      divideResult,
      xorResult,
      andResult,
      orResult,
      leftShiftResult,
      rightShiftResult,
      bitwiseNotResult,
      lessThanResult,
      lessThanOrEqualResult,
      greaterThanResult,
      greaterThanOrEqualResult,
      equalsResult,
      notEqualsResult,
    });

    try {
      const result = await execTest();
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  }
}

async function execTest() {
  return new Promise((resolve, reject) => {
    const command = spawn("nargo", ["execute"], { cwd: scriptsDir });
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

function generateProver({
  valueA,
  valueB,
  sumResult,
  subtractResult,
  multiplyResult,
  divideResult,
  xorResult,
  andResult,
  orResult,
  leftShiftResult,
  rightShiftResult,
  bitwiseNotResult,
  lessThanResult,
  lessThanOrEqualResult,
  greaterThanResult,
  greaterThanOrEqualResult,
  equalsResult,
  notEqualsResult,
}) {
  const proverToml = `
  x = "${valueA}"
  y = "${valueB}"
  sumResult = "${sumResult}"
  subtractResult = "${subtractResult}"
  multiplyResult = "${multiplyResult}"
  divideResult = "${divideResult}"
  xorResult = "${xorResult}"
  andResult = "${andResult}"
  orResult = "${orResult}"
  leftShiftResult = "${leftShiftResult}"
  rightShiftResult = "${rightShiftResult}"
  bitwiseNotResult = "${bitwiseNotResult}"
  lessThanResult = "${lessThanResult}"
  lessThanOrEqualResult = "${lessThanOrEqualResult}"
  greaterThanResult = "${greaterThanResult}"
  greaterThanOrEqualResult = "${greaterThanOrEqualResult}"
  equalsResult = "${equalsResult}"
  notEqualsResult = "${notEqualsResult}"
  `;

  fs.writeFileSync(`${scriptsDir}/Prover.toml`, proverToml);
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir);
    fs.mkdirSync(`${scriptsDir}/src`);
  }
}

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}

main();
