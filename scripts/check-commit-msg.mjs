import { readFileSync } from "node:fs";

const commitMessagePath = process.argv[2];

if (!commitMessagePath) {
  fail("Missing commit message file path.");
}

const firstLine = readFileSync(commitMessagePath, "utf8").split(/\r?\n/, 1)[0] ?? "";
const allowedTypes = new Set([
  "feat",
  "fix",
  "chore",
  "docs",
  "test",
  "refactor",
  "build",
  "ci",
  "perf",
  "style"
]);

if (firstLine.length >= 100) {
  fail("Commit subject must be less than 100 characters.");
}

const match = /^(?<type>[a-z]+)\([a-z0-9-]+\): .+$/u.exec(firstLine);
if (!match?.groups) {
  fail("Commit subject must match: type(scope): message");
}

if (!allowedTypes.has(match.groups.type)) {
  fail(`Commit type must be one of: ${Array.from(allowedTypes).join(", ")}`);
}

function fail(message) {
  console.error(`Invalid commit message: ${message}`);
  process.exit(1);
}
