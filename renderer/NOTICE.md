# Vendored code attribution

`vendor/shared/` is derived from the star-history project:

- Source: https://github.com/star-history/star-history
- Pinned commit: `fb8e1078c9e48c612f830f2cb6c36e046a6697d5`
- License: MIT (see `vendor/LICENSE`)

`render.ts` reproduces the SVG generation flow from that project's
`backend/main.ts`, and the `fixJsdomSvgCasing` helper is copied from its
`backend/utils.ts`.

## Local changes to the vendored copy

The vendored tree is not a verbatim copy. We made three changes:

1. **Removed unused files** that are not reachable from the renderer's entry
   points (`packages/xy-chart` and `common/chart`): `common/repo-data.ts`,
   `types/gh.ts`, `packages/card-landscape1.tsx`, and `packages/radar-svg.ts`.
   These belong to the OG-card feature, which this action does not use.

2. **Blanked `packages/utils/fontData.ts`.** Upstream embeds a ~53 KB base64
   "xkcd" web font there. That font is licensed separately from star-history's
   MIT code, and GitHub strips `@font-face` from SVGs served via `<img>`, so it
   never renders in a README anyway. `render.ts` removes the `<style>` block
   before writing the SVG, so the font is unused; we blank the data to avoid
   redistributing the font.

3. **Added an optional `measureText` hook** (`packages/types.tsx`,
   `packages/xy-chart.tsx`, `packages/utils/drawLegend.tsx`,
   `packages/utils/drawLabels.tsx`). Upstream sizes the legend box and places
   the title logo from a per-character estimate for its embedded xkcd font.
   Since this build ships no font (change 2), every viewer substitutes its own,
   and a wide one (Firefox with a monospace default) ran the legend label past
   its box and the title under its logo. When `render.ts` passes a measurer
   (widths from resvg with the PNG font, see `../textMeasure.ts`), the legend
   box is sized from real widths and the legend and title `<text>` get
   `textLength` + `lengthAdjust="spacingAndGlyphs"`, so any substitute font is
   fitted into the same space. Without the hook the upstream code path is
   unchanged. Every edit is marked `MODIFIED FROM UPSTREAM` in place.

All other files under `vendor/shared/` are copied unchanged from the pinned
commit.

To update the vendored code, re-copy `shared/` from a newer star-history commit,
re-apply the three changes above, and bump the pinned commit.
