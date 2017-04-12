import * as d3 from 'd3';

export const getSvg = (chartClass, width, height, wrapperWidth) => {
    const svg = d3.select('.' + chartClass)
            .attr('width', width)
            .attr('height', height)
            .append('g');

    const chart = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('class', 'chart')
        .attr('transform',
            'translate(' + wrapperWidth / 2 + ',' + 0.66*height + ')'
        );

        chart.append('g')
            .attr('class', 'slices');

    return svg;
};