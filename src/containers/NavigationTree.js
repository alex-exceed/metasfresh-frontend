import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MenuOverlayContainer from '../components/header/MenuOverlayContainer';
import {push} from 'react-router-redux';
import DebounceInput from 'react-debounce-input';
import Container from '../components/Container';

import {
    rootRequest,
    nodePathsRequest,
    queryPathsRequest
 } from '../actions/MenuActions';

import {
    openModal
} from '../actions/WindowActions';

class NavigationTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            rootResults: {
                caption: '',
                children: []
            },
            query: '',
            queriedResults: [],
            deepNode: null
        };
    }

    componentDidMount = () => {
        this.getData();
    }

    getData = (callback) => {
        rootRequest().then(response => {
            this.setState(Object.assign({}, this.state, {
                rootResults: response.data,
                queriedResults: response.data.children,
                query: ''
            }), () => {
                callback();
            })
        }).catch((err) => {
            if(err.response && err.response.status === 404) {
                this.setState(Object.assign({}, this.state, {
                    queriedResults: [],
                    rootResults: {},
                    query: ''
                }), () => {
                    callback();
                })
            }
        });
    }

    openModal = (windowType, type, caption, isAdvanced) => {
        const {dispatch} = this.props;
        dispatch(openModal(caption, windowType, type, null, null, isAdvanced));
    }

    handleQuery = (e) => {
        e.preventDefault();
        if(e.target.value){
            this.setState({
                query: e.target.value
            });

            queryPathsRequest(e.target.value, '', true)
                .then(response => {
                    this.setState({
                        queriedResults: response.data.children
                    })
                }).catch((err) => {
                    if(err.response && err.response.status === 404) {
                        this.setState({
                            queriedResults: [],
                            rootResults: {}
                        })
                    }
                });
        }else{
            this.getData(this.clearValue);
        }

    }

    clearValue = () => {
        document.getElementById('search-input').value=''
    }

    handleClear = (e) => {
        e.preventDefault();
        this.getData(this.clearValue);
    }

    renderTree = () => {
      const {rootResults, queriedResults, query} = this.state;

      return(
          <div>
              <div className="search-wrapper">
                  <div className="input-flex input-primary">
                    <i className="input-icon meta-icon-preview"/>
                    <DebounceInput
                        debounceTimeout={250}
                        type="text" id="search-input"
                        className="input-field"
                        placeholder="Type phrase here"
                        onChange={e => this.handleQuery(e) }
                    />
                    {this.state.query && <i
                        className="input-icon meta-icon-close-alt pointer"
                        onClick={e => this.handleClear(e) }
                    />}
                  </div>
              </div>
              <p
                  className="menu-overlay-header menu-overlay-header-main menu-overlay-header-spaced"
              >
                  {rootResults.caption}
              </p>
              <div className="column-wrapper">
                    {queriedResults && queriedResults.map((subitem, subindex) =>
                        <MenuOverlayContainer
                            key={subindex}
                            printChildren={true}
                            handleClickOnFolder={this.handleDeeper}
                            handleRedirect={this.handleRedirect}
                            handleNewRedirect={this.handleNewRedirect}
                            openModal={this.openModal}
                            {...subitem}
                        />
                    )}
                    { queriedResults.length === 0 && query!='' &&
                        <span>There are no results</span>
                    }
              </div>
          </div>
      )

  }
    handleRedirect = (elementId) => {
        const {dispatch} = this.props;
        dispatch(push('/window/' + elementId));
    }

    handleNewRedirect = (elementId) => {
        const {dispatch} = this.props;
        dispatch(push('/window/' + elementId + '/new'));
    }

    handleDeeper = (e, nodeId) => {
        e.preventDefault();

        nodePathsRequest(nodeId, 4).then(response => {
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
        const {rawModal, modal} = this.props;
        const {rootResults} = this.state;

        return (
            <Container
                siteName = "Sitemap"
                {...{modal, rawModal}}
            >
                {this.renderTree(rootResults)}
            </Container>
        );
    }
}

function mapStateToProps(state) {
    const { windowHandler } = state;

    const {
        modal,
        rawModal
    } = windowHandler || {
        modal: {},
        rawModal: {}
    }

    return {
        modal, rawModal
    }
}

NavigationTree.propTypes = {
    dispatch: PropTypes.func.isRequired,
    modal: PropTypes.object.isRequired,
    rawModal: PropTypes.object.isRequired,
};

NavigationTree = connect(mapStateToProps)(NavigationTree);

export default NavigationTree
