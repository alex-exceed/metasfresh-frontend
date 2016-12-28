import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TableQuickInput from './TableQuickInput';

class TableFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isBatchEntry: false
        }
    }

    handleBatchEntryToggle = () => {
        const {isBatchEntry} = this.state;
        const {toggleFullScreen, tabId} = this.props;

        this.setState(Object.assign({}, this.state, {
            isBatchEntry: !isBatchEntry
        }), () => {
            toggleFullScreen(tabId);
        })
    }

    render() {
        const {
            openModal, toggleFullScreen, fullScreen, docType, docId, tabId, tabIndex
        } = this.props;

        const {
            isBatchEntry
        } = this.state;

        const isFullScreen = (fullScreen === tabId);

        return (
            <div className="form-flex-align">
                <div className="form-flex-align">
                    <div>
                        {!isBatchEntry && <button
                            className="btn btn-meta-outline-secondary btn-distance btn-sm"
                            onClick={openModal}
                            tabIndex={tabIndex}
                        >
                            Add new
                        </button>}
                        <button
                            className="btn btn-meta-outline-secondary btn-distance btn-sm"
                            onClick={this.handleBatchEntryToggle}
                            tabIndex={tabIndex}
                        >
                            {isBatchEntry ? "Close batch entry" : "Batch entry"}
                        </button>
                    </div>
                    {isFullScreen && isBatchEntry &&
                        <TableQuickInput
                            docType={docType}
                            docId={docId}
                            tabId={tabId}
                        />
                    }
                </div>

                {!isBatchEntry && <button
                    className="btn-icon btn-meta-outline-secondary pointer"
                    onClick={() => toggleFullScreen(isFullScreen ? null : tabId)}
                    tabIndex={tabIndex}
                >
                    <i className="meta-icon-fullscreen"/>
                </button>}
            </div>
        )
    }
}

TableFilter.propTypes = {
    dispatch: PropTypes.func.isRequired
}

TableFilter = connect()(TableFilter);

export default TableFilter;
