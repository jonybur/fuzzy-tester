const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const distDir = path.join(__dirname, "dist");

describe("Noir Test Runner", () => {
  beforeAll(() => {
    generateNr(2, 2, 4);
  });

  it("should test noir file", async () => {
    await execTest();
  });
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

function generateNr(valueA, valueB, result) {
  const scriptContent = `
  fn add(x: u64, y: u64) -> u64 { x + y }
  #[test]
  fn test_add() { assert(add(${valueA},${valueB}) == ${result}); }
  `;

  const nargoToml = `[package]
  name = "fuzzer"
  type = "bin"
  compiler_version = "0.10.5"
  [dependencies]`;

  fs.mkdirSync(`${distDir}`);
  fs.mkdirSync(`${distDir}/src`);
  fs.writeFileSync(`${distDir}/Nargo.toml`, nargoToml);
  fs.writeFileSync(`${distDir}/src/main.nr`, scriptContent);
}
