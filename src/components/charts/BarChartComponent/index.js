import React, { Component }from 'react';
import * as d3 from 'd3';

import { getX0Range, getX1Range, getYRange, getZRange } from './ranges';
import { populateXAxis, populateYAxis, moveXAxis, getXAxisLabelsHeight }
    from './axes';
import { getSvg, sizeSvg } from './svg';
import { getHorizontalDimensions, getVerticalDimensions } from './dimensions';
import { drawData } from './data';
import { drawLegend } from './legend';

class BarChartComponent extends Component {
    svg;

    setSvg(){
        const { chartClass } = this.props;

        this.svg = getSvg(chartClass);
    }

    prepare(){
        const {
            data, groupBy, fields, colors, chartClass, height
        } = this.props;

        // colors
        const rangeZ = getZRange(colors);

        // horizontal sizing
        const horizontal =
            getHorizontalDimensions(this.svg, chartClass, height);
        const rangeX0 = getX0Range(horizontal.width, data, groupBy);
        const rangeX1 = getX1Range(rangeX0.bandwidth(), fields);
        populateXAxis(this.svg, rangeX0);

        // vertical sizing
        const labelsHeight = getXAxisLabelsHeight(this.svg);
        const vertical =
            getVerticalDimensions({bottom: labelsHeight, top: 35}, height);
        const rangeY = getYRange(vertical.height, data, fields);
        populateYAxis(this.svg, rangeY);

        // adjust x axis
        moveXAxis(this.svg, vertical.height);

        // adjust svg container
        sizeSvg(this.svg, {
            ...horizontal,
            ...vertical
        });

        drawLegend(this.svg, fields, horizontal, rangeZ);

        return {
            dimensions: {
                ...horizontal,
                ...vertical
            },
            ranges: {
                x0: rangeX0,
                x1: rangeX1,
                y: rangeY,
                z: rangeZ
            }
        }
    }

    draw(prev, reRender){
        const { data, groupBy, fields } = this.props;
        const { dimensions, ranges } = this.prepare();

        drawData(
            this.svg, dimensions, ranges, data, groupBy.fieldName,
            prev, fields, reRender
        );
    }

    addResponsive = () => {
        const { chartClass } = this.props;

        d3.select(window)
            .on('resize.' + chartClass + '-wrapper', () => {
                this.draw()
            })
    };

    componentDidMount() {
        this.setSvg();
        this.draw();
        this.addResponsive();
    }

    shouldComponentUpdate(nextProps){
        return !(this.props.reRender && !nextProps.reRender)
    }

    componentDidUpdate(prevProps){
        const { reRender } = this.props;
        this.draw(prevProps.data, reRender);
    }

    render() {
        const {chartClass, isMaximize, data, fields, groupBy, chartTitle} = this.props;

        return (
            <div className={'chart-wrapper ' + chartClass + '-wrapper'}>
                <svg className={chartClass} />
                {isMaximize && 
                <div className="panel panel-primary panel-bordered chart-data-table-wrapper">
                    <table className="table table-bordered-vertically table-striped">
                        <thead>
                            <tr>
                                <th>{chartTitle}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {data.map((item, index)=> {
                            return(
                                <tr key={index}>
                                    <td>
                                        {item[groupBy.fieldName]}
                                    </td>
                                    <td>
                                        <table className="table table-included">
                                            {fields.map((field, index)=> {
                                                return (
                                                    <tbody key={index}>
                                                        <tr>
                                                            <td>{field.caption}</td>
                                                            <td>{item[field.fieldName] + ' ' +field.unit}</td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            })}
                                        </table>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>}
            </div>
        );
    }
}

export default BarChartComponent;
