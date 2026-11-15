import { CRAWLER_DIRECTORY, validateDirectory } from "../dist/index.js";

const issues = validateDirectory(CRAWLER_DIRECTORY);
if (issues.length > 0) {
  console.error(`invalid crawler directory:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exit(1);
}

console.log(`ok: ${CRAWLER_DIRECTORY.length} entries`);
