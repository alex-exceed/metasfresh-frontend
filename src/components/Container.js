import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import Header from './header/Header';
import NotificationHandler from './notifications/NotificationHandler';

class Container extends Component {
    constructor(props){
        super(props);
    }

    render() {
        const {
            docActionElem, docStatusData, docNoElement, docNoData, docSummaryData,
            dataId, windowType, breadcrumb, references, actions, showSidelist,
            siteName, connectionError, noMargin, entity, children
        } = this.props;

        return (
            <div>
                <Header
                    entity={entity}
                    docStatus = {docActionElem}
                    docStatusData = {docStatusData}
                    docNo = {docNoElement}
                    docNoData = {docNoData}
                    docSummaryData = {docSummaryData}
                    dataId={dataId}
                    windowType={windowType}
                    breadcrumb={breadcrumb}
                    references={references}
                    actions={actions}
                    showSidelist={showSidelist}
                    siteName = {siteName}
                />
                {connectionError && <ErrorScreen />}
                <NotificationHandler />
                <div
                    className={
                        "header-sticky-distance js-unselect " +
                        (!!noMargin ? "dashboard" : "container-fluid")
                    }
                >
                    {children}
                </div>
            </div>
        );
    }
}

export default Container;
