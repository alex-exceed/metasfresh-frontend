import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';

import Header from '../components/app/Header';
import MenuOverlayContainer from '../components/app/MenuOverlayContainer';
import {push} from 'react-router-redux';
import DebounceInput from 'react-debounce-input';
import Container from '../components/Container';


import {
    rootRequest,
    nodePathsRequest,
    queryPathsRequest,
    getWindowBreadcrumb
 } from '../actions/MenuActions';


class NavigationTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            rootResults: {
              caption: "",
              children: [],
              query: "",
              queriedResults: []
          },
          deepNode: null
        };
    }

    componentDidMount = () => {
        const {dispatch, windowType} = this.props;

        this.getData();
        // dispatch(getRootMenu());
        dispatch(getWindowBreadcrumb("143"));
    }

    getData = () => {
        const {dispatch} = this.props;
        dispatch(rootRequest()).then(response => {
            this.setState(Object.assign({}, this.state, {
                rootResults: response.data,
                queriedResults: response.data.children
            }))
        });


    }

    handleQuery = (e) => {
        const {dispatch} = this.props;
        const {rootResults} = this.state;

        e.preventDefault();
        if(!!e.target.value){
            this.setState(Object.assign({}, this.state, {
                query: e.target.value
            }));

            dispatch(queryPathsRequest(e.target.value, 9, true)).then(response => {

                this.setState(Object.assign({}, this.state, {
                    queriedResults: response.data.children
                }))
            });
        }else{
            this.setState(Object.assign({}, this.state, {
                queriedResults: rootResults.children,
                query: ""
            }))
        }

    }

    handleClear = (e) => {
        e.preventDefault();
        const {rootResults} = this.state;

        this.setState(Object.assign({}, this.state, {
            query: "",
            queriedResults: rootResults.children
        }));
    }

    renderTree = (res) => {
      const {dispatch} = this.props;
      const {rootResults, queriedResults} = this.state;

      return(
      <div>
        <div className="search-wrapper">
            <div className="input-flex input-primary">
                <i className="input-icon meta-icon-preview"/>
                <DebounceInput debounceTimeout={250} type="text" className="input-field" placeholder="Type phrase here" value={this.state.query} onChange={e => this.handleQuery(e) } />
                {this.state.query && <i className="input-icon meta-icon-close-alt pointer" onClick={e => this.handleClear(e) } />}
            </div>
        </div>
        <p className="menu-overlay-header menu-overlay-header-main menu-overlay-header-spaced">{rootResults.caption}</p>
        <div className="column-wrapper">
            {queriedResults && queriedResults.map((subitem, subindex) =>
                <MenuOverlayContainer
                    key={subindex}
                    printChildren={true}
                    handleClickOnFolder={this.handleDeeper}
                    handleRedirect={this.handleRedirect}
                    handleNewRedirect={this.handleNewRedirect}
                    {...subitem}
                />
            )}
            </div>
        </div>
      )

    }
    handleRedirect = (elementId) => {
        const {dispatch} = this.props;
        dispatch(push("/window/" + elementId));
    }

    handleNewRedirect = (elementId) => {
        const {dispatch} = this.props;
        dispatch(push("/window/" + elementId + "/new"));
    }

    handleDeeper = (e, nodeId) => {
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
            <Container
                breadcrumb={breadcrumb.slice(0,1)}
                siteName = {"Sitemap"}
            >
                {this.renderTree(rootResults)}
            </Container>
        );
    }
}

function mapStateToProps(state) {
    const { windowHandler, menuHandler } = state;
    const {
        breadcrumb
    } = menuHandler || {
        breadcrumb: []
    }

    return {
        breadcrumb
    }
}

NavigationTree.propTypes = {
    dispatch: PropTypes.func.isRequired,
    breadcrumb: PropTypes.array.isRequired
};

NavigationTree = connect(mapStateToProps)(NavigationTree);

export default NavigationTree
