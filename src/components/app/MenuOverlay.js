import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import MenuOverlayContainer from './MenuOverlayContainer';
import MenuOverlayItem from './MenuOverlayItem';

import {
    nodePathsRequest,
    queryPathsRequest
 } from '../../actions/MenuActions';


class MenuOverlay extends Component {
    constructor(props){
        super(props);
        this.state = {
            queriedResults: [],
            query: "",
            deepNode: null
        };
    }
    handleClickOutside = (e) => {
        const {onClickOutside} = this.props;
        onClickOutside(e);
    }
    handleQuery = (e) => {
        const {dispatch} = this.props;


        e.preventDefault();
        if(!!e.target.value){
            this.setState(Object.assign({}, this.state, {
                query: e.target.value
            }));

            dispatch(queryPathsRequest(e.target.value)).then(response => {
                response.data.children && response.data.children.length > 9 ? response.data.children.length = 9: null;

                this.setState(Object.assign({}, this.state, {
                    queriedResults: response.data.children
                }))
            });
        }else{
            this.setState(Object.assign({}, this.state, {
                queriedResults: [],
                query: ""
            }))
        }
    }
    handleClear = (e) => {
        e.preventDefault();

        this.setState(Object.assign({}, this.state, {
            query: "",
            queriedResults: []
        }));
    }
    handleDeeper = (e, nodeId) => {
        const {dispatch} = this.props;

        e.preventDefault();


        dispatch(nodePathsRequest(nodeId)).then(response => {
            response.data.children.length > 4 ? response.data.children.length = 4 : null;
            this.setState(Object.assign({}, this.state, {
                deepNode: response.data
            }))
        })
    }
    handleClickBack = (e) => {
        e.preventDefault();

        this.setState(Object.assign({}, this.state, {
            deepNode: null
        }))
    }

    renderNaviagtion = (node) => {
        return (
            node.children.map((item,index) =>
                <MenuOverlayContainer
                    key={index}
                    handleClickOnFolder={this.handleDeeper}
                    {...item}
                />
            )
        )
    }
    render() {
        const {queriedResults, deepNode} = this.state;
        const {nodeId, node} = this.props;
        const nodeData = node.children;
        return (
            <div className="menu-overlay menu-overlay-primary">
                <div className="menu-overlay-caption">{nodeData.caption}</div>
                <div className="menu-overlay-body">
                    {nodeId == 0 ?
                        //ROOT

                        <div>
                            {deepNode &&
                                <div>
                                    <span className="menu-overlay-link" onClick={e => this.handleClickBack(e)}>&lt; Back</span>
                                </div>
                            }
                            <div className="menu-overlay-root-body">

                                <div className="menu-overlay-container">
                                    {this.renderNaviagtion(deepNode ? deepNode : nodeData)}
                                </div>

                                <div className="menu-overlay-query">

                                    <div className="input-flex input-primary">
                                        <i className="input-icon meta-icon-preview"/>
                                        <input type="text" className="input-field" placeholder="Type phrase here" value={this.state.query} onChange={e => this.handleQuery(e) } />
                                        {this.state.query && <i className="input-icon meta-icon-close-alt pointer" onClick={e => this.handleClear(e) } />}
                                    </div>

                                    {queriedResults && queriedResults.map((result, index) =>
                                        <MenuOverlayItem
                                            key={index}
                                            handleClickOnFolder={this.handleDeeper}
                                            {...result}
                                        />
                                    )}
                                </div>
                            </div>
                        </div> :
                        //NOT ROOT
                        <div className="menu-overlay-node-container">
                            <p className="menu-overlay-header">{nodeData.caption}</p>
                            {nodeData && nodeData.children.map((item, index) =>
                                <span className="menu-overlay-expanded-link" key={index}>{item.caption}</span>
                            )}
                        </div>
                    }
                </div>
            </div>
        )
    }
}

MenuOverlay.propTypes = {
    dispatch: PropTypes.func.isRequired
};

MenuOverlay = connect()(onClickOutside(MenuOverlay));

export default MenuOverlay
