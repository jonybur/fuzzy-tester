const { spawn } = require("child_process");
const path = require("path");
const SCRIPTS_DIR = path.join(__dirname, "..", "scripts");

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

module.exports = { callNargo };
