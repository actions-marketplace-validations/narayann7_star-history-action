import { D3Selection, TextMeasurer } from "../types"

export const drawTitle = (selection: D3Selection, text: string, logoURL: string, color: string, chartWidth?: number, measureText?: TextMeasurer) => {
    let logoX: string | number = "38%",
        clipX: string | number = "39.5%"
    if (selection.node()?.getBoundingClientRect()) {
        logoX = (selection.node()?.getBoundingClientRect().width as number) * 0.5 - 84
        clipX = (selection.node()?.getBoundingClientRect().width as number) * 0.5 - 73
    }
    if (chartWidth) {
        logoX = chartWidth * 0.5 - 84
        clipX = chartWidth * 0.5 - 73
    }

    const title = selection.append("text").style("font-size", "20px").style("font-weight", "bold").style("fill", color).attr("x", "50%").attr("y", 30).attr("text-anchor", "middle").text(text)
    // MODIFIED FROM UPSTREAM (see ../../../../NOTICE.md). The logo sits at a fixed
    // offset left of center that assumes the title's width in the embedded xkcd
    // font. With no @font-face shipped, a wider substitute font ran the title
    // under the logo, so pin the title to its width in the PNG font.
    if (measureText) {
        title.attr("textLength", measureText(text, 20, "bold")).attr("lengthAdjust", "spacingAndGlyphs")
    }
    selection
        .append("svg")
        .append("defs")
        .append("clipPath")
        .attr("id", "clip-circle-title")
        .append("circle")
        .attr("r", 11)
        .attr("cx", clipX)
        .attr("cy", 12 + 11)
    if (logoURL) {
        selection.append("image").attr("x", logoX).attr("y", 12).attr("height", 22).attr("width", 22).attr("href", logoURL).attr("clip-path", "url(#clip-circle-title)")
    }
}

export const drawXLabel = (selection: D3Selection, text: string, color: string) => {
    selection
        .append("text")
        .style("font-size", "17px")
        .style("fill", color)
        .attr("x", "50%")
        .attr("y", ((selection.attr("height") as unknown as number) || 10) - 10)
        .attr("text-anchor", "middle")
        .text(text)
}

export const drawYLabel = (selection: D3Selection, text: string, color: string, offsetY = 6) => {
    selection
        .append("text")
        .attr("text-anchor", "end")
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("font-size", "17px")
        .style("fill", color)
        .text(text)
        .attr("y", offsetY)
        .call((f) => {
            const defaultTextLength = 100
            let textLength = defaultTextLength
            // Because there is no `getComputedTextLength` method in nodejs env,
            // we have to use it after validate function existed.
            if (f.node()?.getComputedTextLength) {
                textLength = f.node()?.getComputedTextLength() as number
            }

            const offsetX = Math.floor(textLength / 2 - ((selection.attr("height") as unknown as number) || 10) / 2)
            f.attr("x", offsetX)
        })
}
