import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {push} from 'react-router-redux';

import MenuOverlay from './MenuOverlay';
import MasterWidget from '../widget/MasterWidget';

class Breadcrumb extends Component {
	constructor(props) {
		super(props);
	}

    linkToPage = (page) => {
        const {dispatch} = this.props;
        dispatch(push("/window/"+page));
    }

	render() {
        const {
            breadcrumb, homemenu, windowType, docNo, docNoData, docSummaryData, dataId,
            siteName, menuOverlay, handleMenuOverlay
        } = this.props;

        return (
            <span className="header-breadcrumb">
                <span>
                    <div
                        className={"notification-container pointer " +
                            (menuOverlay === homemenu.nodeId ? "notification-open " : "")}
                        onClick={ e => handleMenuOverlay(e, homemenu.nodeId) }
                    >
                        <span className={"notification icon-sm"}>
                            <i className="meta-icon-menu" />
                        </span>
                    </div>
                    {menuOverlay === homemenu.nodeId &&
                        <MenuOverlay
                            nodeId={homemenu.nodeId}
                            node={homemenu}
                            onClickOutside={e => handleMenuOverlay(e, "")}
                            disableOnClickOutside={menuOverlay !== homemenu.nodeId}
                            siteName={siteName}
                        />
                    }
                </span>

                {breadcrumb && breadcrumb.map((item, index) =>
                    <span>
                        {!!index && <span className="divider">/</span>}

                        <span key={index}>
                            <div
                                title={item.children.captionBreadcrumb}
                                className={"notification-container pointer " +
                                    (menuOverlay === item.nodeId ? "notification-open " : "")}
                                onClick={ !item.children.elementId ?  e => handleMenuOverlay(e, item.nodeId) : (windowType ? e => this.linkToPage(windowType) : '' )}
                            >
                                <span className={"notification"}>
                                    {item && item.children && item.children.captionBreadcrumb}
                                </span>
                            </div>
                            {menuOverlay === item.nodeId &&
                                <MenuOverlay
                                    nodeId={item.nodeId}
                                    node={item}
                                    onClickOutside={e => handleMenuOverlay(e, "")}
                                    disableOnClickOutside={menuOverlay !== item.nodeId}
                                    siteName={siteName}
                                    index={index}
                                />
                            }
                        </span>
                    </span>
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
        )
	}
}

Breadcrumb.propTypes = {
	dispatch: PropTypes.func.isRequired
};

Breadcrumb = connect()(Breadcrumb)

export default Breadcrumb
