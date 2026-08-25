// renderer/textMeasure.test.ts
import { createTextMeasurer } from "./textMeasure";
import { fileURLToPath } from "node:url";
import assert from "node:assert";

const measure = createTextMeasurer(
  [
    fileURLToPath(new URL("./fonts/ComicNeue-Regular.ttf", import.meta.url)),
    fileURLToPath(new URL("./fonts/ComicNeue-Bold.ttf", import.meta.url)),
  ],
  "Comic Neue"
);

// Empty text measures zero instead of throwing on an empty bbox.
assert.strictEqual(measure("", 15), 0);
console.log("PASS: empty text is 0");

// The width reflects the glyphs, not the character count: ten M's are far
// wider than ten i's.
const wide = measure("MMMMMMMMMM", 15);
const narrow = measure("iiiiiiiiii", 15);
assert(wide > narrow * 2, `expected M-run (${wide}) to be much wider than i-run (${narrow})`);
console.log("PASS: width follows glyph shapes", wide, narrow);

// Width scales with font size.
const label = "narayann7/star-history-action";
const w15 = measure(label, 15);
const w30 = measure(label, 30);
assert(Math.abs(w30 / w15 - 2) < 0.05, `expected ~2x at double size, got ${w30 / w15}`);
console.log("PASS: width scales with font size", w15, w30);

// A typical 15px repo label lands well below upstream's 7.5px-per-character
// estimate for the xkcd font, i.e. this is a real measurement of Comic Neue.
assert(w15 > 150 && w15 < label.length * 7.5, `unexpected width ${w15} for "${label}"`);
console.log("PASS: measures the bundled font");

// Bold weight picks the bold face (Comic Neue Bold is wider than Regular).
const regular = measure("Star History", 20);
const bold = measure("Star History", 20, "bold");
assert(bold > regular, `expected bold (${bold}) wider than regular (${regular})`);
console.log("PASS: bold weight resolves to the bold face", regular, bold);

// XML-special characters are escaped rather than breaking the probe document.
assert(measure("a&b<c>d", 15) > 0);
console.log("PASS: escapes xml characters");

console.log("ALL TEXT MEASURE TESTS PASSED");
