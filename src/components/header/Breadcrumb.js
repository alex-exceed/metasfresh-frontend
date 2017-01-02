import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {push} from 'react-router-redux';

import MenuOverlay from './MenuOverlay';
import MasterWidget from '../widget/MasterWidget';
import Tooltips from '../tooltips/Tooltips';
import keymap from '../../keymap.js';

class Breadcrumb extends Component {
	constructor(props) {
		super(props);

        this.state = {
            tooltip: {
                open: false
            }
        }
	}

    linkToPage = (page) => {
        const {dispatch} = this.props;
        dispatch(push("/window/"+page));
    }

    toggleTooltip = (tooltip) => {
        this.setState(
            Object.assign({}, this.state, {
                tooltip: Object.assign({}, this.state, {
                    open: tooltip
                })
            })
        );
    }

    renderBtn = (menu, index) => {
        const {handleMenuOverlay, menuOverlay, windowType, siteName} = this.props;
        return (<div key={index}>
            {!!index && <span className="divider">/</span>}
            <div className={"header-btn tooltip-parent"}>
                <div
                    title={!!index && menu.children.captionBreadcrumb ? !!index && menu.children.captionBreadcrumb : ''}
                    className={"header-item-container pointer " +
                        (menuOverlay === menu.nodeId ? "header-item-open " : "") +
                        (!index ? "header-item-container-static ": "")
                    }
                    onClick={ !(menu && menu.children && menu.children.elementId) ?
                        e => handleMenuOverlay(e, menu.nodeId) : (windowType ? e => this.linkToPage(windowType) : '' )
                    }
                    onMouseEnter={!!index ? '' : (e) => this.toggleTooltip(true)}
                    onMouseLeave={(e) => this.toggleTooltip(false)}
                >
                    <span className={"header-item icon-sm"}>
                        {!!index ? menu.children.captionBreadcrumb : <i className="meta-icon-menu" />}
                    </span>
                </div>
                {menuOverlay === menu.nodeId &&
                    <MenuOverlay
                        nodeId={menu.nodeId}
                        node={menu}
                        onClickOutside={e => handleMenuOverlay(e, "")}
                        disableOnClickOutside={menuOverlay !== menu.nodeId}
                        siteName={siteName}
                    />
                }
            </div>
        </div>)
    }

	render() {
        const {
            breadcrumb, homemenu, windowType, docNo, docNoData, docSummaryData, dataId,
            siteName, menuOverlay, handleMenuOverlay
        } = this.props;

        const {tooltip} = this.state;

        return (
            <span className="header-breadcrumb-wrapper">
                    {
                        tooltip.open &&
                        <Tooltips
                            extraClass="tooltip-home-menu"
                            name={keymap.GLOBAL_CONTEXT.OPEN_NAVIGATION_MENU}
                            action={'Open submenu'}
                            type={''}
                        />
                    }
                <span className="header-breadcrumb">
                    
                    {this.renderBtn(homemenu, 0)}

                    {breadcrumb && breadcrumb.map((item, index) =>
                        this.renderBtn(item,index+1)
                    )}

                    {docNo && <span className="divider">/</span>}

                    {docNo && <span className="header-input-id header-input-sm">
                        <MasterWidget
                            windowType={windowType}
                            dataId={dataId}
                            widgetData={[docNoData]}
                            noLabel={true}
                            icon={true}
                            {...docNo}
                        />
                    </span>}

                    {docSummaryData && <div className="header-breadcrumb">
                        <span>{docSummaryData.value}</span>
                    </div>}

                    {siteName && <span className="divider">/</span>}

                    {siteName && <div className="header-breadcrumb">
                        <span>{siteName}</span>
                    </div>}

                </span>
            </span>
            
        )
	}
}

Breadcrumb.propTypes = {
	dispatch: PropTypes.func.isRequired
};

Breadcrumb = connect()(Breadcrumb)

export default Breadcrumb
