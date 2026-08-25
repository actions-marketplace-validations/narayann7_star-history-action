# Changelog

All notable changes to this action are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims
to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-08-26

### Fixed
- The legend label no longer runs past its box, and the title no longer runs
  under the owner logo, in viewers whose substitute font is wider than the
  bundled one (Firefox with a monospace default font, for example). The SVG
  ships no `@font-face`, so upstream's fixed per-character width estimate was
  off by whatever font the browser picked. The legend box is now sized from
  text widths measured in the PNG font (resvg with the same font files), and
  the legend and title `<text>` carry `textLength` so any substitute font is
  fitted into that width. Every theme is rendered with the same `font-family`
  so their layouts match. `RENDER_VERSION` is bumped, so the first run after
  upgrade re-renders and commits even with flat stars. ([#7])
- The SVG now asks for a font stack (`xkcd, "Comic Neue", "Chalkboard SE",
  "Comic Sans MS", sans-serif`) instead of the bare `xkcd` family nobody has,
  so a browser substitutes a font close in width to the bundled Comic Neue and
  the `textLength` fitting above stays mild. Before, the substitute was the
  browser's default font, and a monospace default meant text compressed by
  about a quarter. The PNG is unaffected, since resvg skips families it has not
  loaded. ([#7])
- Callers whose `package.json` pins npm without a committed lockfile no longer
  fail on the "Set up Node" step. `actions/setup-node` v5+ turns dependency
  caching on by itself when no `cache` input is given, keyed off the *caller's*
  `package.json` in `GITHUB_WORKSPACE` rather than the renderer's own tree under
  `$ACTION_PATH`. The action now passes `package-manager-cache: false`, keeping
  the v4 behaviour. ([#6])

### Changed
- `actions/checkout` and `actions/setup-node` bumped from v4 to v7, in the
  action itself and in the repo's own workflows and examples. ([#6])

### Compatibility
- The rendered chart changes shape slightly: the legend box is now as wide as
  the text it holds instead of the old per-character estimate, and legend and
  title text is drawn at its measured width. Existing charts are regenerated on
  the next run; no input or output of the action changed. ([#7])

## [1.0.5] - 2026-08-09

### Changed
- The chart no longer draws the "star-history.com" watermark in the bottom-right
  corner. The vendored renderer is untouched; the watermark text and its icon
  are stripped after rendering, alongside the existing `<style>` and
  `.browser-only` strips. Attribution for the vendored star-history code stays
  where the MIT license needs it, in `renderer/vendor/LICENSE` and
  `renderer/NOTICE.md`.
- The change-detection signature now includes a `RENDER_VERSION` constant, so a
  change to how the chart is drawn reaches every repo on the next run instead of
  waiting for a star change or a day rollover. This release bumps it, so the
  first run after upgrade re-renders and commits even with flat stars.

## [1.0.4] - 2026-07-18

### Fixed
- A GitHub API rate-limit or access 403 while refreshing an already-committed
  chart no longer fails the workflow. When a chart already exists, the run keeps
  it and exits cleanly (logging a warning), and refreshes on the next run once
  the limit resets. Retrying alone could not cover this: the automatic Actions
  token's primary limit (1000 requests/hour per repo) resets up to an hour out,
  far beyond the retry's wait cap, so a drained quota still failed the run. The
  first run with no chart yet still fails loudly, since there is nothing to keep
  and a 403 there usually means the token cannot read the target repo.
- The dogfood `watch` workflow now sets `concurrency: cancel-in-progress: true`,
  so a burst of stars collapses into a single refresh instead of queuing one run
  per star. Each render spends ~40 API requests; without collapsing, a star
  burst drained the per-repo hourly quota and made later runs 403.

### Documentation
- Condensed the README and added a "Rate limits" section covering the per-repo
  1000/hour Actions-token cap, the 5000/hour PAT cap, and the burst failure mode.

## [1.0.3] - 2026-07-14

### Fixed
- Transient GitHub API rate-limit failures no longer fail the run. The renderer
  now retries stargazer requests with backoff when GitHub returns a rate-limit
  403 (per-repo hourly limit or a secondary/abuse limit on the Actions token),
  429, or 5xx, honoring `Retry-After` / `x-ratelimit-reset` when present. A
  genuine access 403 or an unauthorized 401 is not retried, so real token
  problems still fail fast.

## [1.0.2] - 2026-07-12

### Added
- `font-family` input. Set it to any Google Fonts family (for example
  `Patrick Hand`) and the renderer downloads that font at run time and applies
  it to the PNG chart. The action reads the font's real internal name so it
  matches even when that differs from the family string, and non-Latin families
  such as `Noto Sans SC` work. Empty input keeps the bundled Comic Neue with no
  network call, and any download failure falls back to Comic Neue without
  failing the run. This affects the PNG only, since GitHub strips `@font-face`
  from README-embedded SVGs.
- Optional `watch: types: [started]` trigger, documented alongside the cron
  schedule and `workflow_dispatch`, so a chart can refresh right after a new
  star. It supplements the schedule rather than replacing it: `watch` fires on
  new stars only, never on unstars, and does not refresh the time axis on quiet
  days.

### Compatibility
- The change-detection signature now includes the requested font, so changing
  only `font-family` invalidates the cache and re-renders. As a side effect the
  signature format changed, so the first run after upgrading regenerates the
  chart once even when the star count is unchanged.

## [1.0.1] - 2026-07-11

### Added
- PNG output. The renderer now rasterizes a `star-history.png` alongside the
  SVGs, so the chart shows on registries that cannot render SVG (npm, pub.dev).
- `readme-format` input (`picture` or `png`). `picture` keeps the SVG
  `<picture>` block with GitHub dark/light support; `png` writes a plain
  Markdown image at an absolute `raw.githubusercontent.com` URL, which is the
  form that renders on npm and pub.dev.

### Changed
- Stable filenames. Charts are written to fixed paths
  (`star-history-<theme>.svg`, `star-history.png`) and overwritten in place
  instead of timestamped names. A frozen README URL on a registry no longer
  404s when a new chart is generated.
- The action's own repository now demos with a static placeholder and no longer
  commits its live chart into git.

### Fixed
- PNG rasterization stripped the decorative `feTurbulence`/`feDisplacementMap`
  sketch filter, which crashed the raster engine (resvg). The SVG output keeps
  the filter; only the PNG drops it.

### Compatibility
- Repositories upgrading from 1.0.0 keep their old timestamped files. Those are
  left in place so any already published registry README that points at the old
  URL still resolves. The action stops producing timestamped names but does not
  delete existing ones.
- On the first run after upgrade, the chart is regenerated even when the star
  count is unchanged, so the new stable files and the PNG are created once.

## [1.0.0] - 2026-07-06

### Added
- Initial release. Composite GitHub Action that renders a star history chart in
  the repository's own CI, where the token can still read its own stargazers,
  and commits the chart into the repo so the README embeds a static file.
- Chart rendering via star-history's own renderer, vendored under
  `renderer/vendor` and run in Node with JSDOM and svgo. No headless browser and
  no third-party CLI.
- Light and dark SVG themes, embedded via a `<picture>` block between
  `<!-- star-history:start -->` and `<!-- star-history:end -->` markers.
- Change detection by star data signature, so a run only commits when the stars
  actually move or the day rolls over.
- Triggers for push, cron schedule, and manual dispatch, with a documented
  own-repos scope and PAT guidance for repos the default token cannot read.

[#7]: https://github.com/narayann7/star-history-action/pull/7
[#6]: https://github.com/narayann7/star-history-action/pull/6

[1.0.6]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.6
[1.0.5]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.5
[1.0.4]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.4
[1.0.3]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.3
[1.0.2]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.2
[1.0.1]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.1
[1.0.0]: https://github.com/narayann7/star-history-action/releases/tag/v1.0.0
