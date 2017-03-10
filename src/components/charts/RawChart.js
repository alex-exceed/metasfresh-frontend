import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import BarChart from './BarChartComponent';
import PieChart from './PieChartComponent';

import {
    getKPIData,
    getTargetIndicatorsData
} from '../../actions/AppActions';

class RawChart extends Component {
    constructor(props){
        super(props);

        this.state = {
            chartData: [],
            intervalId: null
        }
    }

    getData(){
        const { id, chartType } = this.props;

        if (chartType === 'Indicator') {
            return getTargetIndicatorsData(id)()
                .then(response => {
                    return response.data.datasets[0].values
                });
        }

        return getKPIData(id)()
            .then(response => {
                return response.data.datasets[0].values
            })
    }

    fetchData(){
        this.getData()
            .then(chartData => {
                this.setState({ chartData });
            });
    }

    componentDidMount(){
        const { pollInterval } = this.props;

        this.fetchData();

        if (pollInterval){
            this.setState({
                intervalId: setInterval(() => {
                    this.fetchData();
                }, pollInterval * 1000)
            })
        }
    }

    componentWillUnmount(){
        const {intervalId} = this.state;

        if (intervalId){
            clearInterval(intervalId);

            this.setState({
                intervalId: null
            })
        }
    }

    renderChart() {
        const {
            id, chartType, caption, fields, groupBy, kpiCaption, reRender
        } = this.props;
        const {chartData} = this.state;
        const height = 400;

        switch(chartType){
            case 'BarChart':
                return(
                    <BarChart
                        chartType={chartType}
                        caption={caption}
                        fields={fields}
                        groupBy={groupBy}
                        data={chartData}
                        chartClass={'chart-' + id}
                        height={height}
                        reRender={reRender}
                        colors = {['#89d729', '#9aafbd', '#7688c9', '#c1ea8e', '#c9d5dc', '#aab5e0', '#6aad18', '#298216', '#32520d', '#605a7f']}
                    />
                );
            case 'PieChart':
                return(
                    <PieChart
                        chartClass={'chart-' + id}
                        responsive={true}
                        data={chartData}
                        fields={fields}
                        groupBy={groupBy}
                        height={height}
                        colors = {['#89d729', '#9aafbd', '#7688c9', '#c1ea8e', '#c9d5dc', '#aab5e0', '#6aad18', '#298216', '#32520d', '#605a7f']}
                    />
                )
            case 'Indicator':
                return(
                    <div className="indicator">
                        <div className="indicator-value">{
                            chartData[0][fields[0].fieldName] +
                            (fields[0].unit ? ' ' + fields[0].unit : '')}</div>
                        <div className="indicator-kpi-caption">{kpiCaption}</div>
                    </div>
                )
        }
    }

    render(){
        const {chartData} = this.state;
        return chartData.length > 0 && this.renderChart();
    }
}

RawChart = connect()(RawChart);

export default RawChart;
