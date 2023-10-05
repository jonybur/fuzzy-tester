const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const distDir = path.join(__dirname, "dist");

describe("Noir Fuzzy Test Runner", () => {
  let valuesToTest = [];

  beforeAll(() => {
    ensureDirectoryStructure();
    const max64bit = 18446744073709551615n;
    for (let i = 0; i < 10; i++) {
      const valueA = getRandomBigInt(max64bit / 3n, max64bit / 2n);
      const valueB = getRandomBigInt(max64bit / 3n, max64bit / 2n);
      const result = valueA + valueB;
      valuesToTest.push({ valueA, valueB, result });
    }
  });

  it(`should test noir`, async () => {
    generateNr(valuesToTest);
    await execTest();
  }, 30000);
});

async function execTest() {
  return new Promise((resolve, reject) => {
    const command = spawn("nargo", ["prove"], { cwd: distDir });
    command.on("close", (code) => {
      if (code === 0) {
        const command = spawn("nargo", ["verify"], { cwd: distDir });
        command.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject("Could not verify.");
          }
        });
        command.on("error", (error) => {
          reject(`Error executing nargo test: ${error}`);
        });
      } else {
        reject("Could not prove.");
      }
    });
    command.on("error", (error) => {
      reject(`Error executing nargo test: ${error}`);
    });
  });
}

function generateNr(valuesToTest) {
  const test = valuesToTest[0];

  const proverToml = `
    x = "${test.valueA}"
    y = "${test.valueB}"
    result = "${test.result}"
  `;

  fs.writeFileSync(`${distDir}/Prover.toml`, proverToml);
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    fs.mkdirSync(`${distDir}/src`);
  }
}

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}
