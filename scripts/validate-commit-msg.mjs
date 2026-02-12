#!/usr/bin/env node
/**
 * Validates that commit message contains only ASCII characters.
 * Prevents mojibake caused by PowerShell/terminal encoding issues on Windows.
 * @see .cursor/rules/magic-sim.mdc
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const commitMsgPath = process.argv[2];
if (!commitMsgPath) {
  console.error("validate-commit-msg: No commit message file path provided");
  process.exit(1);
}

let content;
try {
  content = readFileSync(resolve(commitMsgPath), "utf8");
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
} catch (err) {
  console.error("validate-commit-msg: Failed to read commit message:", err.message);
  process.exit(1);
}

const lines = content.split(/\r?\n/);
const nonAsciiRe = /[^\u0000-\u007F]/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(nonAsciiRe);
  if (match) {
    console.error(
      `validate-commit-msg: Non-ASCII character found (line ${i + 1}). ` +
        "Use English only to prevent mojibake. See .cursor/rules/magic-sim.mdc"
    );
    console.error(
      `  Offending character: "${match[0]}" (U+${match[0].charCodeAt(0).toString(16).toUpperCase()})`
    );
    process.exit(1);
  }
}
