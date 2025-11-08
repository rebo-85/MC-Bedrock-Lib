const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../src/types/index.d.ts");
const out = path.join(__dirname, "../dist/mc-bedrock-lib.d.ts");

function extractAllBlocks(src, pattern) {
  const blocks = [];
  let idx = 0;
  while (true) {
    const startIdx = src.indexOf(pattern, idx);
    if (startIdx === -1) break;
    let i = startIdx + pattern.length;
    let depth = 1;
    let block = pattern;
    while (i < src.length && depth > 0) {
      const char = src[i];
      block += char;
      if (char === "{") depth++;
      if (char === "}") depth--;
      i++;
    }
    blocks.push(block);
    idx = i;
  }
  return blocks;
}

const srcContent = fs.readFileSync(src, "utf8");
const outContent = fs.readFileSync(out, "utf8");

let patch = "";
const globalBlock = extractAllBlocks(srcContent, "declare global {");
globalBlock.forEach((b) => (patch += "\n" + b + "\n"));

const modulePattern = /declare module\s+["'][^"']+["'] \{/g;
let match;
while ((match = modulePattern.exec(srcContent)) !== null) {
  const blocks = extractAllBlocks(srcContent, match[0]);
  blocks.forEach((b) => (patch += "\n" + b + "\n"));
}

if (patch) fs.appendFileSync(out, patch);

const patchedContent = fs.readFileSync(out, "utf8");
const propertyRegex = /^(\s*)([a-zA-Z0-9_]+)\s*[:(]/gm;

function addPropertyComments(dtsContent) {
  return dtsContent.replace(propertyRegex, (match, indent, prop) => {
    const before = dtsContent.slice(dtsContent.indexOf(match) - 3, dtsContent.indexOf(match));
    if (before.includes("/**")) return match;
    return match;
  });
}

const commented = addPropertyComments(patchedContent);
fs.writeFileSync(out, commented);
