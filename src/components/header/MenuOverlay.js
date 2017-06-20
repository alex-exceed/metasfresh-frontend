import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import MenuOverlayContainer from './MenuOverlayContainer';
import MenuOverlayItem from './MenuOverlayItem';
import {push} from 'react-router-redux';
import DebounceInput from 'react-debounce-input';
import {
    queryPathsRequest,
    pathRequest,
    getWindowBreadcrumb,
    flattenLastElem,
    getRootBreadcrumb
} from '../../actions/MenuActions';

class MenuOverlay extends Component {
    constructor(props){
        super(props);
        this.state = {
            queriedResults: [],
            query: '',
            deepSubNode: null,
            path: '',
            data: {}
        };
    }

    componentDidMount = () => {
        getRootBreadcrumb().then(response => {
            this.setState({
                data: response
            })
        })
    }

    handleClickOutside = (e) => this.props.onClickOutside(e);

    handleQuery = (e) => {
        e.preventDefault();
        if(e.target.value){
            this.setState({
                query: e.target.value
            })
            queryPathsRequest(e.target.value, 9).then(response => {
                this.setState({
                    queriedResults: flattenLastElem(response.data)
                })
            }).catch((err) => {
                if(err.response && err.response.status === 404) {
                    this.setState({
                        queriedResults: []
                    })
                }
            });
        }else{

            this.setState({
                query: '',
                queriedResults: []
            }, ()=> {
                document.getElementById('search-input-query').value=''
            });
        }
    }

    handleClear = (e) => {
        e.preventDefault();
        this.setState({
            query: '',
            queriedResults: []
        }, ()=> {
            document.getElementById('search-input-query').value=''
        });
    }

    handleRedirect = (elementId, isNew) => {
        this.handleClickOutside();

        this.props.dispatch(
            push('/window/' + elementId + (isNew ? '/new' : ''))
        );
    }

    handleNewRedirect = (elementId) => this.handleRedirect(elementId, true);

    handlePath = (nodeId) => {
        pathRequest(nodeId).then(response => {
            let pathArray = [];
            let node = response.data;

            do{
                const children = node.children && node.children[0];
                node.children = undefined;

                pathArray.push(node);
                node = children;
            }while(node);

            //remove first MENU element
            pathArray.shift();

            this.setState({
                path: pathArray
            })
        });
    }

    renderPath = (path) => {
        return (
            <span>
                {path && path.map((item, index) =>
                    <span key={index}>
                        {item.nodeId > 0 ?
                            ((index > 0 ? ' / ' : '') +
                                item.captionBreadcrumb
                            ) : item.captionBreadcrumb
                        }
                    </span>
                )}
            </span>
        )
    }

    renderNaviagtion = (node) => {
        const {handleMenuOverlay, openModal, dispatch, siteName} = this.props;
        return (
             <div
                className="menu-overlay-container-column-wrapper js-menu-overlay"
                tabIndex={0}
                onKeyDown={(e) => this.handleKeyDown(e)}
             >
                <div className="menu-overlay-top-spacer" />
                <div>
                    <span
                        className="menu-overlay-header menu-overlay-header-spaced menu-overlay-header-main pointer js-menu-header"
                        onClick={() => dispatch(push('/'))}
                        tabIndex={0}
                        onKeyDown={(e) => this.handleKeyDown(e)}
                    >
                        Dashboard
                    </span>
                </div>
                {siteName !== 'Sitemap' &&
                    <div>
                        <span
                            className="menu-overlay-header menu-overlay-header-spaced menu-overlay-header-main pointer js-menu-header"
                            onClick={() => dispatch(push('/sitemap'))}
                            tabIndex={0}
                            onKeyDown={(e) => this.handleKeyDown(e)}
                        >
                            Browse whole tree
                        </span>
                    </div>
                }
                <div>
                    {node && node.children && node.children.map((item, index) =>
                        <MenuOverlayContainer
                            key={index}
                            handleClickOnFolder={this.handleDeeper}
                            handleRedirect={this.handleRedirect}
                            handleNewRedirect={this.handleNewRedirect}
                            handlePath={this.handlePath}
                            parent={node}
                            printChildren={true}
                            transparentBookmarks={true}
                            back={e => this.handleClickBack(e)}
                            handleMenuOverlay={handleMenuOverlay}
                            openModal={openModal}
                            {...item}
                        />
                    )}
                </div>
            </div>
        )
    }

    renderSubnavigation = (nodeData) => {
        const {handleMenuOverlay, openModal} = this.props;
        return(
            <div>
                <MenuOverlayContainer
                    handleClickOnFolder={this.handleDeeper}
                    handleRedirect={this.handleRedirect}
                    handleNewRedirect={this.handleNewRedirect}
                    handlePath={this.handlePath}
                    parent={nodeData}
                    printChildren={true}
                    transparentBookmarks={true}
                    back={e => this.handleClickBack(e)}
                    handleMenuOverlay={handleMenuOverlay}
                    openModal={openModal}
                    subNavigation={true}
                    children={nodeData.children}
                    type={nodeData.type}
                />
            </div>
        )
    }

    linkClick = (item) => {
        const {dispatch} = this.props;
        if(item.elementId && item.type == 'newRecord') {
            this.handleNewRedirect(item.elementId)
        } else if (item.elementId && item.type == 'window'){
            this.handleRedirect(item.elementId)
            dispatch(getWindowBreadcrumb(item.elementId));
        }
    }

    handleKeyDown = (e) => {
        const {handleMenuOverlay} = this.props;
        const input = document.getElementById('search-input-query');
        const firstMenuItem =
            document.getElementsByClassName('js-menu-item')[0];
        const firstQueryItem =
            document.getElementsByClassName('menu-overlay-query')[0]
                .getElementsByClassName('js-menu-item')[0];
        switch(e.key){
            case 'ArrowDown':
                if(document.activeElement === input) {
                    firstQueryItem.focus();
                }
                break;
            case 'Tab':
                 e.preventDefault();
                 if(document.activeElement === input) {
                     firstMenuItem.focus();
                 } else {
                     input.focus();
                 }
                 break;
            case 'Enter':
                e.preventDefault();
                document.activeElement.click();
                break;
            case 'Backspace':
                if(document.activeElement !== input){
                    e.preventDefault();
                    this.handleClickBack(e);
                    document.getElementsByClassName('js-menu-overlay')[0]
                        .focus();
                }
                break;
            case 'Escape':
                e.preventDefault();
                handleMenuOverlay('', '');
        }
    }

    render() {
        const {
            queriedResults, deepSubNode, query, data
        } = this.state;
        const {
            nodeId, node, handleMenuOverlay, openModal
        } = this.props;
        const nodeData = nodeId == '0' ? data : node.children;
        return (
            <div
                className="menu-overlay menu-overlay-primary"
            >
                <div className="menu-overlay-body breadcrumbs-shadow">

                { nodeId == 0 ?
                    //ROOT
                    <div className="menu-overlay-root-body">
                        {this.renderNaviagtion(data)}
                        <div
                            className="menu-overlay-query hidden-sm-down"
                        >
                            <div className="input-flex input-primary">
                                <i
                                    className="input-icon meta-icon-preview"
                                />
                                <DebounceInput
                                    debounceTimeout={250}
                                    type="text"
                                    id="search-input-query"
                                    className="input-field"
                                    placeholder="Type phrase here"
                                    onChange={e => this.handleQuery(e)}
                                    onKeyDown={(e) =>
                                        this.handleKeyDown(e)}
                                />
                                {query && <i
                                    className="input-icon meta-icon-close-alt pointer"
                                    onClick={e => this.handleClear(e)}
                                />}
                            </div>
                            {queriedResults && queriedResults.map(
                                (result, index) =>
                                    <MenuOverlayItem
                                        transparentBookmarks={true}
                                        key={index}
                                        handleClickOnFolder={
                                            this.handleDeeper
                                        }
                                        handleRedirect={
                                            this.handleRedirect
                                        }
                                        handleNewRedirect={
                                            this.handleNewRedirect
                                        }
                                        query={true}
                                        handlePath={this.handlePath
                                        }
                                        handleMenuOverlay={
                                            handleMenuOverlay
                                        }
                                        openModal={openModal}
                                        {...result}
                                    />
                            )}
                            {queriedResults.length === 0 &&
                                query != '' &&
                                <span>There are no results</span>
                            }
                        </div>
                    </div> :
                    //NOT ROOT
                    <div
                    className="menu-overlay-node-container menu-suboverlay">
                            {
                                    <p className="menu-overlay-header">
                                        {nodeData && nodeData.caption}
                                    </p>
                            }
                            {this.renderSubnavigation(
                                deepSubNode ? deepSubNode : nodeData
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

export default MenuOverlay;
