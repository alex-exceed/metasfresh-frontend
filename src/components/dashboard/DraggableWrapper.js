import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'react/lib/update';
import ChartWidget from './ChartWidget';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import logo from '../../assets/images/metasfresh_logo_green_thumb.png';
import RawChart from '../charts/RawChart';
import DndWidget from './DndWidget';
import Sidenav from './Sidenav';
import Placeholder from './Placeholder';
import Indicator from '../charts/Indicator';

import {
    getKPIsDashboard,
    getTargetIndicatorsDashboard
} from '../../actions/AppActions';

import {
    addDashboardWidget,
    removeDashboardWidget
} from '../../actions/BoardActions';

import {
    connectWS,
    disconnectWS
} from '../../actions/WindowActions';

import {
    patchRequest
} from '../../actions/GenericActions';

export class DraggableWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            indicators: [],
            idMaximized: null,
            websocketEndpoint: null
        };
    }
    
    componentDidMount = () => {
        this.getDashboard();
        this.getIndicators();
    }
    
    componentDidUpdate = (prevProps, prevState) => {
        const {websocketEndpoint} = this.state;
        if(
            websocketEndpoint !== null &&
            prevState.websocketEndpoint !== websocketEndpoint
        ){
            connectWS.call(this, websocketEndpoint, msg => {
                msg.events.map(event => {
                    switch(event.widgetType){
                        case 'TargetIndicator':
                            this.getIndicators();
                            break;
                        case 'KPI':
                            this.getDashboard();
                            break;
                    }
                })
            })
        }
    }
    
    componentWillUnmount = () => {
        disconnectWS.call(this);
    }
    
    getType = (entity) => entity === 'cards' ? 'kpis' : 'targetIndicators';
    
    getIndicators = () => {
        getTargetIndicatorsDashboard().then(response => {
            this.setState({
                indicators: response.data.items
            });
        });
    }
    
    getDashboard = () => {
        getKPIsDashboard().then(response => {
            this.setState({
                cards: response.data.items,
                websocketEndpoint: response.data.websocketEndpoint
            });
        });
    }
    
    addCard = (entity, id) => {
        const tmpItemIndex = this.state[entity].findIndex(i => i.id === id);
        addDashboardWidget(this.getType(entity), id, tmpItemIndex).then(res => {
            this.setState(prev => update(prev, {
                [entity]: {
                    [tmpItemIndex]: {$set: res.data}
                }
            }));
        });
    }
    
    onDrop = (entity, id) => {
        const tmpItemIndex = this.state[entity].findIndex(i => i.id === id);
        patchRequest(
            'dashboard', null, null, null, null, 'position',
            tmpItemIndex, this.getType(entity), id
        );
    }
    
    moveCard = (entity, dragIndex, hoverIndex, item) => {
        const draggedItem = this.state[entity][dragIndex];
        if(draggedItem){
            // When we are inserting added
            this.setState(prev => update(prev, {
                [entity]: {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, draggedItem]
                    ]
                }
            }));
        }else{
            // When we are adding card
            const newItem = {
                id: item.id,
                fetchOnDrop: true,
                kpi: {chartType: this.getType(entity)}
            };
            this.setState(prev => update(prev, {
                [entity]: prev[entity].length === 0 ? {
                    $set: [newItem]
                } : {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, newItem]
                    ]
                }
            }));
        }
    }
    
    removeCard = (entity, index, id) => {
        removeDashboardWidget(this.getType(entity), id);
        this.setState(prev => update(prev, {
            [entity]: {
                $splice: [
                    [index, 1]
                ]
            }
        }));
    }
    
    maximizeWidget = (id) => {
        this.setState({
            idMaximized: id
        })
    }
    
    renderIndicators = () => {
        const {indicators, idMaximized} = this.state;
        const {editmode} = this.props;
        
        if(!indicators.length && editmode) return (
            <div className='indicators-wrapper'>
                <DndWidget
                    moveCard={this.moveCard}
                    addCard={this.addCard}
                    entity={'indicators'}
                    placeholder={true}
                    transparent={!editmode}
                >
                    <Placeholder
                        entity={'indicators'}
                        description={'Drop Target Indicator widget here.'}
                    />
                </DndWidget>
            </div>
        );
        
        if(!indicators.length) return false;
        
        return (
            <div
                className={'indicators-wrapper'}
            >
                {indicators.map((indicator, id) =>
                    <DndWidget
                        key={id}
                        id={indicator.id}
                        index={id}
                        moveCard={this.moveCard}
                        addCard={this.addCard}
                        onDrop={this.onDrop}
                        removeCard={this.removeCard}
                        entity={'indicators'}
                        transparent={!editmode}
                    >
                        <RawChart
                            id={indicator.id}
                            index={id}
                            caption={indicator.caption}
                            fields={indicator.kpi.fields}
                            pollInterval={indicator.kpi.pollIntervalSec}
                            chartType={'Indicator'}
                            kpi={false}
                            noData={indicator.fetchOnDrop}
                            {...{editmode}}
                        />
                    </DndWidget>
                )}
            </div>
        )
    }
    
    renderKpis = () => {
        const {cards, idMaximized} = this.state;
        const {editmode} = this.props;
        
        if(!cards.length && editmode) return (
            <div className="kpis-wrapper">
                <DndWidget
                    placeholder={true}
                    entity={'cards'}
                    moveCard={this.moveCard}
                    addCard={this.addCard}
                    transparent={!editmode}
                >
                    <Placeholder
                        entity={'cards'}
                        description={'Drop KPI widget here.'}
                    />
                </DndWidget>
            </div>
        );
        
        return (
            <div className="kpis-wrapper">
                {cards.length > 0 ? cards.map((item, id) => {
                    return (
                        <DndWidget
                            key={id}
                            index={id}
                            id={item.id}
                            moveCard={this.moveCard}
                            addCard={this.addCard}
                            onDrop={this.onDrop}
                            removeCard={this.removeCard}
                            entity={'cards'}
                            className={
                                'draggable-widget ' +
                                (idMaximized === item.id ?
                                    'draggable-widget-maximize ' : '')
                            }
                            transparent={!editmode}
                        >
                            <ChartWidget
                                key={item.id}
                                id={item.id}
                                index={id}
                                chartType={item.kpi.chartType}
                                caption={item.caption}
                                fields={item.kpi.fields}
                                groupBy={item.kpi.groupByField}
                                pollInterval={item.kpi.pollIntervalSec}
                                kpi={true}
                                moveCard={this.moveCard}
                                idMaximized={idMaximized}
                                maximizeWidget={this.maximizeWidget}
                                text={item.caption}
                                noData={item.fetchOnDrop}
                                {...{editmode}}
                            />
                        </DndWidget>
                    );
                }) :
                <div className="dashboard-wrapper dashboard-logo-wrapper">
                    <div className="logo-wrapper">
                        <img src={logo} />
                    </div>
                </div>}
            </div>
        )
    }
    
    render() {
        const {editmode, toggleEditMode} = this.props;
        
        return (
            <div className="dashboard-cards-wrapper">
                <div
                    className={(editmode ?
                        'dashboard-edit-mode' : 'dashboard-cards')}>
                    {this.renderIndicators()}
                    {this.renderKpis()}
                </div>
                {editmode &&
                    <Sidenav
                        addCard={this.addCard}
                    />
                }
            </div>
        );
    }
}
    
DraggableWrapper.propTypes = {
    dispatch: PropTypes.func.isRequired
};

DraggableWrapper = connect()(DragDropContext(HTML5Backend)(DraggableWrapper));

export default DraggableWrapper;
