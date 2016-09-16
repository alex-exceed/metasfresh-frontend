import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';

import Header from '../components/app/Header';
import MenuOverlayContainer from '../components/app/MenuOverlayContainer';
import NavigationTreeItem from '../components/app/NavigationTreeItem';
import {push} from 'react-router-redux';

import {
    rootRequest,
    nodePathsRequest
 } from '../actions/MenuActions';

class NavigationTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            rootResults: {
              caption: "",
              children: []
          },
          deepNode: null
        };
    }
    renderTree = (res) => {
      const {dispatch} = this.props;
      const {rootResults} = this.state;

      dispatch(rootRequest()).then(response => {
        this.setState(Object.assign({}, this.state, {
            rootResults: response.data
        }))
      });

      return(
        <div>
            <p className="menu-overlay-header">{rootResults.caption}</p>
            {rootResults.children && rootResults.children.map((subitem, subindex) =>
                <NavigationTreeItem
                    key={subindex}
                    handleRedirect={this.handleRedirect}
                    handleClickOnFolder={this.handleDeeper}
                    {...subitem}
                />
            )}
        </div>
      )

    }
    handleRedirect = (elementId) => {
        const {dispatch} = this.props;
        dispatch(push("/window/" + elementId));
    }
    handleDeeper = (e, nodeId) => {
        console.log('handleClickOnFolder');
        const {dispatch} = this.props;

        e.preventDefault();


        dispatch(nodePathsRequest(nodeId,4)).then(response => {
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

    render() {
        const {master, connectionError, modal, breadcrumb} = this.props;
        const {nodeId, node} = this.props;
        const {rootResults, deepNode} = this.state;

        return (
          <div className="map-tree-wrapper">
              <Header
                  breadcrumb={breadcrumb}
              />
              {connectionError && <ErrorScreen />}

              <div className="container">
                <div className="row">
                {this.renderTree(deepNode ? deepNode : rootResults)}
                </div>
              </div>

          </div>
        );
    }
}

NavigationTree.propTypes = {
    dispatch: PropTypes.func.isRequired
};

NavigationTree = connect()(NavigationTree);

export default NavigationTree
