// VEYLA — Hot Springs of the High Snow.
// Copies the pre-rendered poster (entry.png, JPEG bytes, 1024x1024) to the output folder.
// Output folder: $MAKEFUN_OUTPUT_DIR if set, otherwise /output. Node 22 built-ins only.
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here: string = dirname(fileURLToPath(import.meta.url));
const source: string = join(here, 'entry.png');
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const target: string = join(outDir, 'entry.png');

const MAX_BYTES = 1_048_576;
const size: number = statSync(source).size;
if (size > MAX_BYTES) {
  console.error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
console.log(`wrote ${target} (${size} bytes)`);
