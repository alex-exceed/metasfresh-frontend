import React, { Component } from 'react';
import * as d3 from 'd3';

class PieChartComponent extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount() {
        const {data, responsive, colors} = this.props;

        const color = d3.scaleOrdinal()
            .range(colors);

        const dimensions = this.setDimensions();

        dimensions && this.drawChart(
            dimensions.wrapperWidth, dimensions.width, dimensions.height,
            dimensions.pie, dimensions.arc, data, color, dimensions.radius
        );

        if(responsive){
            this.addResponsive(data, color);
        }

    }

    shouldComponentUpdate(nextProps){
        return !(this.props.reRender && !nextProps.reRender)
    }

    componentDidUpdate() {
        const {data, colors, chartClass} = this.props;
        const chartWrapp =
            document.getElementsByClassName(chartClass + '-wrapper')[0];
        const color = d3.scaleOrdinal()
            .range(colors);
        this.clearChart();
        const dimensions =
            chartWrapp && this.setDimensions(chartWrapp.offsetWidth);
        dimensions && this.drawChart(
            dimensions.wrapperWidth, dimensions.width, dimensions.height,
            dimensions.pie, dimensions.arc, data, color
        );
    }

    setDimensions = (width = 400) => {
        const {chartClass, responsive, fields, height} = this.props;
        let wrapperWidth = 0;
        let chartWidth = width;
        let chartHeight = height;

        const chartWrapper =
            document.getElementsByClassName(chartClass + '-wrapper')[0];

        if(responsive) {
            wrapperWidth = chartWrapper && chartWrapper.offsetWidth;
            chartWidth = wrapperWidth;
        }
        const radius = Math.min(chartWidth, 0.66*chartHeight) / 2;
        const arc =
            d3.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);
        const pie = d3.pie()
            .sort(null)
            .value( d => d[fields[0].fieldName]);

        return {
                wrapperWidth: wrapperWidth,
                width: chartWidth,
                height: chartHeight,
                radius: radius,
                arc: arc,
                pie: pie
            };
    }
    drawChart = (wrapperWidth, width, height, pie, arc, data, color) => {
        const {chartClass, fields} = this.props;

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
        chart.append('g')
            .attr('class', 'labels');
        chart.append('g')
            .attr('class', 'lines');

        const g = d3.select('.slices').selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', arc)
            .attr('class', 'pie-path')
            .style('fill', d => color(d.data[fields[0].fieldName]));

        this.drawLegend(svg, width, height, color);
    };

    drawLegend = (svg, width, height, color) => {
        const {groupBy, data} = this.props;

        const legend = svg
            .attr('width', width)
            .attr('height', 0.30*height)
            .append('g')
            .attr('class', 'legends')
            .attr('transform', 'translate(' + 20 + ',' + 20 + ')');

        const legendRectSize = 18;
        const legendSpacing = 4;

        const legendItem = legend.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            const height = legendRectSize + legendSpacing;
            const vert = i * height;
            return 'translate(' + 0 + ',' + vert + ')';
        });

        legendItem.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

        legendItem.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .attr('font-size', 12)
        .text(function(d, i) {
            return data[i][groupBy.fieldName] + (
                groupBy.unit ? ' [' + groupBy.unit + ']' : ''
            );
        });
    };

    addResponsive = (data, color) => {
        const {chartClass} = this.props;
        const chartWrap =
            document.getElementsByClassName(chartClass+'-wrapper')[0];

        d3.select(window)
            .on('resize.'+chartClass, () => {
                this.clearChart();
                const dimensions =
                    chartWrap && this.setDimensions(chartWrap.offsetWidth);
                dimensions && this.drawChart(
                    dimensions.wrapperWidth, dimensions.width,
                    dimensions.height, dimensions.pie, dimensions.arc, data,
                    color
                );
            });
    };

    clearChart = () => {
        const {chartClass} = this.props;
        const chart = document.getElementsByClassName(chartClass)[0];

        chart && chart.childNodes[0].remove();
    };

    render() {
        const {chartClass} = this.props;
        return (
            <div className={chartClass+'-wrapper' + ' chart-wrapper'}>
                <svg className={chartClass} />
            </div>
        );
    }
}

export default PieChartComponent;
