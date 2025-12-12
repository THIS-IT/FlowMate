const fs = require("fs");
const path = require("path");

const nvmrcPath = path.join(__dirname, "..", ".nvmrc");
const banner = (lines) =>
  ["", "--------------------------------", ...lines, "--------------------------------", ""].join("\n");

let requiredRaw = "";
try {
  requiredRaw = fs.readFileSync(nvmrcPath, "utf8").trim();
} catch (err) {
  console.error(
    banner([
      " Missing .nvmrc",
      " Add the required Node version to .nvmrc (e.g., 22)",
    ])
  );
  process.exit(1);
}

const requiredMajor = parseInt(requiredRaw.split(".")[0], 10);
const [currentMajor] = process.versions.node.split(".").map(Number);

if (Number.isNaN(requiredMajor)) {
  console.error(
    banner([
      " .nvmrc is invalid",
      ` Found   : ${requiredRaw || "(empty)"}`,
      " Expected: a version like 22 or 22.0.0",
    ])
  );
  process.exit(1);
}

if (Number.isNaN(currentMajor) || currentMajor !== requiredMajor) {
  console.error(
    banner([
      " Unsupported Node version",
      ` Required: ${requiredRaw} (from .nvmrc)`,
      ` Current : ${process.version}`,
      ` Fix     : nvm use ${requiredRaw}  # or install it first`,
    ])
  );
  process.exit(1);
}
