/**
 * Text width measurement for chart layout.
 *
 * The chart SVG ships no @font-face (see fontData.ts), so every viewer draws it
 * with whatever font it substitutes for the missing "xkcd" family, and those
 * fonts differ in width. Upstream star-history sizes the legend box and places
 * the title logo from a per-character estimate for its embedded font, which a
 * wide substitute (Firefox with a monospace default, for example) overflows.
 *
 * The fix is to lay the chart out for one known font and pin each label to that
 * width with SVG textLength, so a substitute font is fitted into the same space
 * instead of spilling out of it. The known font is the one the PNG is
 * rasterized with, measured here by resvg itself with the same font files, so
 * the PNG shows the text at its natural width and only browsers do any fitting.
 */
import { Resvg } from "@resvg/resvg-js";

export type FontWeight = "normal" | "bold";

/** Width in px of `text` at `fontSize`, as drawn from the given font files. */
export type TextMeasurer = (text: string, fontSize: number, fontWeight?: FontWeight) => number;

export function createTextMeasurer(fontFiles: string[], fontFamily: string): TextMeasurer {
  return (text, fontSize, fontWeight = "normal") => {
    if (!text) return 0;
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // A canvas comfortably wider than any glyph run, so nothing gets clipped.
    const canvasWidth = Math.ceil(text.length * fontSize * 2) + 200;
    const probe =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${fontSize * 4}">` +
      `<text x="100" y="${fontSize * 2}" font-size="${fontSize}" font-weight="${fontWeight}">${escaped}</text>` +
      `</svg>`;
    // No font-family on the probe: it resolves to defaultFontFamily, exactly
    // like the chart's unavailable "xkcd" family does when the PNG is rendered.
    const bbox = new Resvg(probe, {
      font: { loadSystemFonts: false, fontFiles, defaultFontFamily: fontFamily },
    }).getBBox();
    // The ink bounding box is what must stay inside the legend box. Round up to
    // 0.1px so float noise never makes the box a hair too narrow.
    return bbox ? Math.ceil(bbox.width * 10) / 10 : 0;
  };
}
