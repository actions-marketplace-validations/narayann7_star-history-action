import { Selection } from "d3-selection"

export type D3Selection = Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>

export type Position = "down_right" | "down_left" | "up_right" | "up_left"

export type LegendPosition = "top-left" | "bottom-right"

// MODIFIED FROM UPSTREAM (see ../../../NOTICE.md). Width in px of `text` drawn
// at `fontSize` in the font the PNG is rasterized with. Supplied by render.ts
// so the legend box and title are laid out for real widths instead of a
// per-character estimate for the embedded xkcd font this build does not ship.
export type TextMeasurer = (text: string, fontSize: number, fontWeight?: "normal" | "bold") => number

export const colors = [
    "#dd4528", "#28a3dd", "#f3db52", "#ed84b5", "#4ab74e", "#9179c0", "#8e6d5a", "#f19839", "#949494",
    "#1a9988", "#c75dab", "#6a8e2f", "#d4583b", "#3767b0", "#e8a735", "#7c4dff", "#00897b", "#c2185b", "#5c6bc0", "#e67e22",
]

export const darkColors = [
    "#ff6b6b", "#48dbfb", "#feca57", "#ff9ff3", "#1dd1a1", "#f368e0", "#ff9f43", "#a4b0be", "#576574",
    "#00d2d3", "#f78fb3", "#badc58", "#ff7979", "#7ed6df", "#f9ca24", "#b388ff", "#4dd0e1", "#ff80ab", "#9fa8da", "#f5b041",
]

// Compact palette used by backend SVG generation
export const colorsCompact = ["#dd4528", "#28a3dd", "#f3db52", "#ed84b5", "#4ab74e", "#9179c0", "#8e6d5a", "#f19839", "#949494"]

export const darkColorsCompact = ["#ff6b6b", "#48dbfb", "#feca57", "#ff9ff3", "#1dd1a1", "#f368e0", "#ff9f43", "#a4b0be", "#576574"]
