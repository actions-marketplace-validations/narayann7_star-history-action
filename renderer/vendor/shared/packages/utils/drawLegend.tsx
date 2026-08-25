import { D3Selection, LegendPosition, TextMeasurer } from "../types"
import uniq from "lodash/uniq"

interface DrawLegendConfig {
    items: {
        color: string
        text: string
        logo: string
    }[]
    strokeColor: string
    backgroundColor: string
    legendPosition: LegendPosition
    chartWidth: number
    chartHeight: number
    // MODIFIED FROM UPSTREAM (see ../../../../NOTICE.md), optional.
    measureText?: TextMeasurer
}

const drawLegend = (selection: D3Selection, { items, strokeColor, backgroundColor, legendPosition, chartWidth, chartHeight, measureText }: DrawLegendConfig) => {
    const legendXPadding = 7
    const legendYPadding = 6
    const xkcdCharWidth = 7
    const xkcdCharHeight = 20
    const colorBlockWidth = 8
    const logoSize = 14
    const fontSize = 15

    const legend = selection.append("svg")
    const backgroundLayer = legend.append("svg")
    const textLayer = legend.append("svg")
    let maxTextLength = 0
    // If repos have more than one unique owner, draw logo before legend.
    const shouldDrawLogo = uniq(items.map((i) => i.text.split("/")[0])).length > 1

    // Calculate background dimensions first
    items.forEach((item) => {
        maxTextLength = Math.max(item.text.length, maxTextLength)
    })

    // MODIFIED FROM UPSTREAM (see ../../../../NOTICE.md). Upstream sizes the box
    // from a per-character estimate for its embedded xkcd font. This build ships
    // no @font-face, so every viewer substitutes its own font and a wide one
    // (Firefox with a monospace default) ran the label past the box. With a
    // measurer, size the box from each label's real width in the PNG font and
    // pin that width onto the <text> as textLength below, so any substitute font
    // is fitted into the same space. Without one, keep upstream's estimate.
    const textOffsetX = legendXPadding + colorBlockWidth + (shouldDrawLogo ? legendXPadding + logoSize : 0) + 6
    const textWidths = measureText ? items.map((item) => measureText(item.text, fontSize)) : []

    let bboxWidth = maxTextLength * (xkcdCharWidth + 0.5) + colorBlockWidth + legendXPadding
    const backgroundWidth = measureText
        ? textOffsetX + Math.max(0, ...textWidths) + legendXPadding
        : Math.max(bboxWidth + legendXPadding * 2, maxTextLength * xkcdCharWidth + colorBlockWidth + legendXPadding * 2 + 6 + (shouldDrawLogo ? legendXPadding + logoSize : 0))
    const backgroundHeight = items.length * xkcdCharHeight + legendYPadding * 2

    // Calculate position based on legendPosition
    let legendX = 8
    let legendY = 5

    if (legendPosition === "bottom-right") {
        legendX = chartWidth - backgroundWidth - 8
        legendY = chartHeight - backgroundHeight - 15
    }

    items.forEach((item, i) => {
        // draw color dot
        textLayer
            .append("rect")
            .style("fill", item.color)
            .attr("width", colorBlockWidth)
            .attr("height", colorBlockWidth)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("filter", "url(#xkcdify)")
            .attr("x", legendX + legendXPadding)
            .attr("y", legendY + 12 + xkcdCharHeight * i)
        if (shouldDrawLogo) {
            textLayer
                .append("defs")
                .append("clipPath")
                .attr("id", `clip-circle-title-${item.text}`)
                .append("circle")
                .attr("r", logoSize / 2)
                .attr("cx", legendX + legendXPadding + colorBlockWidth + legendXPadding + logoSize / 2)
                .attr("cy", legendY + 12 + xkcdCharHeight * i - 4 + logoSize / 2)
            textLayer
                .append("image")
                .attr("x", legendX + legendXPadding + colorBlockWidth + legendXPadding)
                .attr("y", legendY + 12 + xkcdCharHeight * i - 4)
                .attr("height", logoSize)
                .attr("width", logoSize)
                .attr("href", item.logo)
                .attr("clip-path", `url(#clip-circle-title-${item.text})`)
        }
        // draw text
        const label = textLayer
            .append("text")
            .style("font-size", `${fontSize}px`)
            .style("fill", strokeColor)
            .attr("x", legendX + textOffsetX)
            .attr("y", legendY + 12 + xkcdCharHeight * i + 8)
            .text(item.text)
        if (measureText) {
            // spacingAndGlyphs scales the glyphs to the pinned width; the default
            // (spacing only) would leave a wide substitute font's letters
            // overlapping each other.
            label.attr("textLength", textWidths[i]).attr("lengthAdjust", "spacingAndGlyphs")
        }
    })

    // Update bboxWidth with actual width if possible
    if (textLayer.node()?.getBBox) {
        bboxWidth = textLayer.node()?.getBBox().width as number
    }

    // add background
    backgroundLayer
        .append("rect")
        .style("fill", backgroundColor)
        .attr("fill-opacity", 0.85)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("filter", "url(#xkcdify)")
        .attr("width", backgroundWidth)
        .attr("height", backgroundHeight)
        .attr("x", legendX)
        .attr("y", legendY)
}

export default drawLegend
