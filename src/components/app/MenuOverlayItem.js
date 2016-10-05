import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import {
    getWindowBreadcrumb
 } from '../../actions/MenuActions';

class MenuOverlayItem extends Component {
    constructor(props){
        super(props);
    }
    clickedItem = (e, elementId, nodeId, type ) => {
        const {handleClickOnFolder, handleRedirect, handleNewRedirect} = this.props;

        if(type === 'newRecord'){
            handleNewRedirect(elementId);
        } else if (type === 'window') {
            this.handleClick(elementId)
        } else if (type === 'group') {
            handleClickOnFolder(e, nodeId)
        }
    }

    onMouseDown = (type, nodeId) => {
        const {handlePath} = this.props;

        if(type === 'group'){
            handlePath(nodeId)
        }
    }

    renderBreadcrumb = (elementId) => {
        const {dispatch} = this.props;

        dispatch(getWindowBreadcrumb(elementId));
    }

    handleClick = (elementId) => {
        const {handleRedirect} = this.props;
        handleRedirect(elementId);
        this.renderBreadcrumb(elementId)
    }

    render() {
        const {dispatch, nodeId, type, elementId, caption, children, handleClickOnFolder, handleRedirect, handleNewRedirect, handlePath, query} = this.props;

        return (
            <div
                className={
                    "menu-overlay-expanded-link "
                }
            >

            { !query &&
                <span
                    className={
                        (children ? "menu-overlay-expand" : "menu-overlay-link")
                    }
                    onClick={e => children ? handleClickOnFolder(e, nodeId) : (type==='newRecord' ? handleNewRedirect(elementId) : this.handleClick(elementId))}
                    onMouseDown={ e => children ? handlePath(nodeId) : ''}
                >
                {caption}
                </span>

            }

            { query &&
               <span className={children ? "" : (type === 'group'? "query-clickable-group" : "query-clickable-link")}
                onClick={ children ? '' : e => this.clickedItem(e, elementId, nodeId, type)  }
                onMouseDown={ e => this.onMouseDown(type, nodeId)}
               >
                    {children ? children.map(
                        (item, id) =>
                            <div key={id} className="query-results" >
                                <div className="query-caption">{caption +' / '}</div>
                                <span className={type === 'group' ? "query-clickable-group" : "query-clickable-link"}
                                     onClick={e => this.clickedItem(e, item.elementId, item.nodeId, item.type)}
                                     onMouseDown={e => this.onMouseDown(item.type, item.nodeId)}
                                >
                                    {item.caption}
                                </span>
                            </div>
                        ) : caption}
               </span>
            }
            </div>
        )
    }
}

MenuOverlayItem.propTypes = {
    dispatch: PropTypes.func.isRequired
};

MenuOverlayItem = connect()(MenuOverlayItem);

export default MenuOverlayItem
