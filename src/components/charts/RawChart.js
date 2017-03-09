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
        const { id, kpi } = this.props;

        if (kpi) {
            return getKPIData(id)()
                .then(response => {
                    return response.data.datasets[0].values
                })
        }

        return getTargetIndicatorsData(id)()
            .then(response => {
                return response.data.data
            });
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

        this.setState({
            intervalId: setInterval(() => {
                this.fetchData();
            }, pollInterval * 1000)
        })
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId);

        this.setState({
            intervalId: null
        })
    }

    renderChart() {
        const {
            id, chartType, caption, fields, groupBy
        } = this.props;
        const {chartData} = this.state;
        const colors = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'];

        switch(chartType){
            case 'BarChart':
                return(
                    <BarChart
                        chartType={chartType}
                        caption={caption}
                        fields={fields}
                        groupBy={groupBy}
                        data={chartData}
                        colors={colors}
                        chartClass={'chart-' + id}
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
                    />
                )
        }
    }

    render(){
        const {chartData} = this.state;
        return chartData.length > 0 && this.renderChart();
    }
}

RawChart.propTypes = {
    dispatch: PropTypes.func.isRequired
};

RawChart = connect()(RawChart);

export default RawChart;
