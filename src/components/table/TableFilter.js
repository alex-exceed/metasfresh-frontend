import React, { Component } from 'react';

class TableFilter extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="form-flex-align h-oneline-push-right">
                <input type="text" className="input-primary pull-xs-left" placeholder="Enter filter phrase" />
                <button className="btn-icon btn-meta-outline-secondary pull-xs-right"><i className="meta-icon-fullscreen"/></button>
                <button className="btn-icon btn-meta-outline-secondary pull-xs-right"><i className="meta-icon-add"/></button>
            </div>
        )
    }
}

export default TableFilter
