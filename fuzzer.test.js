const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const distDir = path.join(__dirname, "dist");

describe("Noir Fuzzy Test Runner", () => {
  let valuesToTest = [];

  beforeAll(() => {
    ensureDirectoryStructure();
    for (let i = 0; i < 10; i++) {
      const valueA = getRandomInt(1, 100000);
      const valueB = getRandomInt(1, 100000);
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
    const command = spawn("nargo", ["test"], { cwd: distDir });

    command.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject("Noir tests did not pass.");
      }
    });

    command.on("error", (error) => {
      reject(`Error executing nargo test: ${error}`);
    });
  });
}

function generateNr(valuesToTest) {
  const tests = valuesToTest.reduce((acc, item, index) => {
    const { valueA, valueB, result } = item;
    return (
      acc +
      `
      #[test]
      fn test${index}() { assert(add(${valueA},${valueB}) == ${result}); }
    `
    );
  }, "");

  const scriptContent = `
  fn add(x: u64, y: u64) -> u64 { x + y }
  ${tests}
  `;

  const nargoToml = `[package]
  name = "fuzzer"
  type = "bin"
  compiler_version = "0.10.5"
  [dependencies]`;

  fs.writeFileSync(`${distDir}/Nargo.toml`, nargoToml);
  fs.writeFileSync(`${distDir}/src/main.nr`, scriptContent);
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    fs.mkdirSync(`${distDir}/src`);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
