import { spawn } from "node:child_process";

const databaseUrl =
  process.env.OZ_SCRAPER_DATABASE_URL ??
  "postgres://oz:oz@localhost:5432/oz_scraper?sslmode=disable";

let shuttingDown = false;
let appProcess;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? "null"} signal ${signal ?? "null"}`
        )
      );
    });
  });
}

function stopAppAndExit(code) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (appProcess && !appProcess.killed) {
    appProcess.kill("SIGINT");
  }

  process.exit(code);
}

process.on("SIGINT", () => stopAppAndExit(0));
process.on("SIGTERM", () => stopAppAndExit(0));

try {
  await runCommand("pnpm", ["--filter", "@oz-scraper/restate", "build"]);

  appProcess = spawn("pnpm", ["--filter", "@oz-scraper/restate", "start"], {
    stdio: "inherit",
    env: {
      ...process.env,
      OZ_SCRAPER_DATABASE_URL: databaseUrl
    }
  });

  appProcess.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const exitCode = code ?? 1;
    console.error(
      `Local Restate app exited unexpectedly with code ${exitCode} signal ${signal ?? "null"}`
    );
    process.exit(exitCode);
  });

  await runCommand("docker", [
    "compose",
    "run",
    "--rm",
    "--no-deps",
    "--entrypoint",
    "sh",
    "restate-register",
    "-ec",
    [
      "export RESTATE_ADMIN_URL=http://host.docker.internal:9070",
      "until restate deployments register --force --yes http://host.docker.internal:9080; do",
      "  sleep 2",
      "done"
    ].join("\n")
  ]);
} catch (error) {
  console.error("Failed to start local Restate app and register deployment.", error);
  stopAppAndExit(1);
}
