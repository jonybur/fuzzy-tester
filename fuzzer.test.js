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
  const imports = `
    use dep::std::option::Option;
  `;

  const tests = valuesToTest.reduce((acc, item, index) => {
    const { valueA, valueB, result } = item;
    return (
      acc +
      `
      #[test]
      fn test${index}() { 
        let none = Option::none();
        let some = Option::some(${valueA});
      
        assert(none.is_none());
        assert(some.is_some());

        assert(add(${valueA},${valueB}) == ${result});

        assert(some.unwrap() == ${valueA});

        assert(none.unwrap_or(${valueB}) == ${valueB});
        assert(some.unwrap_or(${valueB}) == ${valueA});

        assert(none.unwrap_or_else(|| ${valueB + result}) == ${
        valueB + result
      });
        assert(some.unwrap_or_else(|| ${valueB + result}) == ${valueA});

        assert(none.map(|x| x * ${valueB}).is_none());
        assert(some.map(|x| x * ${valueB}).unwrap() == ${valueA * valueB});

        assert(none.map_or(${valueB}, |x| x * ${valueB}) == ${valueB});
        assert(some.map_or(${valueB}, |x| x * ${valueB}) == ${valueA * valueB});

        assert(none.map_or_else(|| ${valueB}, |x| x * ${valueB}) == ${valueB});
        assert(some.map_or_else(|| ${valueB}, |x| x * ${valueB}) == ${
        valueA * valueB
      });

        assert(none.and(some).is_none());
        assert(some.and(none).is_none());
        assert(some.and(some).is_some());

        assert(none.or(some).is_some());
        assert(some.or(none).is_some());
        assert(some.or(some).is_some());

        assert(none.xor(some).is_some());
        assert(some.xor(none).is_some());
        assert(some.xor(some).is_none());
      }
    `
    );
  }, "");

  const scriptContent = `
    ${imports}
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

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}
