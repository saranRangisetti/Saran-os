#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Build configuration
const config = {
  nodeVersion: process.version,
  memoryLimit: 4096,
  timeout: 300000, // 5 minutes
  retries: 3,
};

async function runCommand(command, options = {}) {
  const { retries = 1, timeout = config.timeout } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logStep(`Attempt ${attempt}/${retries}`, `Running: ${command}`);

      const result = execSync(command, {
        stdio: "inherit",
        timeout,
        env: {
          ...process.env,
          NODE_ENV: "production",
          NEXT_TELEMETRY_DISABLED: "1",
          NODE_OPTIONS: `--max-old-space-size=${config.memoryLimit}`,
        },
      });

      return result;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      logWarning(`Command failed, retrying... (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function checkPrerequisites() {
  logStep("Prerequisites", "Checking build environment...");

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (majorVersion < 18) {
    logError(
      `Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`
    );
    process.exit(1);
  }

  logSuccess(`Node.js version: ${nodeVersion}`);

  // Check if package.json exists
  if (!fs.existsSync("package.json")) {
    logError(
      "package.json not found. Please run this script from the project root."
    );
    process.exit(1);
  }

  // Check if node_modules exists
  if (!fs.existsSync("node_modules")) {
    logWarning("node_modules not found. Running npm install...");
    await runCommand("npm ci --legacy-peer-deps");
  }

  logSuccess("Prerequisites check completed");
}

async function runTypeCheck() {
  logStep("Type Check", "Running TypeScript type checking...");
  await runCommand("npm run typecheck");
  logSuccess("Type checking passed");
}

async function runLinting() {
  logStep("Linting", "Running ESLint and Stylelint...");
  try {
    await runCommand("npm run lint");
    logSuccess("Linting passed");
  } catch (error) {
    logWarning("Linting failed, but continuing with build...");
  }
}

async function runTests() {
  logStep("Testing", "Running test suite...");
  try {
    await runCommand("npm run test:ci");
    logSuccess("Tests passed");
  } catch (error) {
    logWarning("Tests failed, but continuing with build...");
  }
}

async function runPrebuild() {
  logStep("Prebuild", "Running prebuild scripts...");
  await runCommand("npm run build:prebuild");
  logSuccess("Prebuild completed");
}

async function runBuild() {
  logStep("Build", "Building Next.js application...");
  await runCommand("npm run build:ci");
  logSuccess("Build completed");
}

async function verifyBuild() {
  logStep("Verification", "Verifying build output...");

  const outDir = "out";
  if (!fs.existsSync(outDir)) {
    logError("Build output directory not found");
    process.exit(1);
  }

  const indexFile = path.join(outDir, "index.html");
  if (!fs.existsSync(indexFile)) {
    logError("index.html not found in build output");
    process.exit(1);
  }

  logSuccess("Build verification completed");
}

async function main() {
  const startTime = Date.now();

  try {
    log(
      `${colors.bold}${colors.blue}🚀 Starting SaranOS Build Process${colors.reset}\n`
    );

    await checkPrerequisites();
    await runTypeCheck();
    await runLinting();
    await runTests();
    await runPrebuild();
    await runBuild();
    await verifyBuild();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logSuccess(`Build completed successfully in ${duration}s`);
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logError(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the build
main();
