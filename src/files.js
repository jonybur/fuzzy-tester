const fs = require("fs");
const path = require("path");
const SCRIPTS_DIR = path.join(__dirname, "..", "scripts");

function isNumber(value) {
  return typeof value === "bigint" || typeof value === "number";
}

function ensureDirectoryStructure() {
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR);
    fs.mkdirSync(`${SCRIPTS_DIR}/src`);
  }
}

function writeResults(errors) {
  fs.writeFileSync(`${SCRIPTS_DIR}/results.json`, JSON.stringify(errors));
}

function writeProver(projectName, values) {
  const proverToml = Object.keys(values).reduce((acc, name) => {
    const value = values[name];
    return acc + `${name}=${isNumber(value) ? `"${value}"` : `${value}`}\n`;
  }, "");
  fs.writeFileSync(
    `${SCRIPTS_DIR}/crates/${projectName}/Prover.toml`,
    proverToml
  );
}

module.exports = { ensureDirectoryStructure, writeProver, writeResults };
