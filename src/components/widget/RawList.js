import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class RawList extends Component {
    constructor(props) {
        super(props);
    }

    handleBlur = (e) => {
        this.dropdown.classList.remove("input-dropdown-focused");
    }

    handleFocus = (e) => {
        e.preventDefault();
        const {onFocus} = this.props;

        onFocus && onFocus();

        this.dropdown.classList.add("input-dropdown-focused");
    }

    handleChange = (e) => {
        e.preventDefault();

        this.handleBlur();
    }

    handleSelect = (option) => {
        const {onSelect} = this.props;

        onSelect(option);

        this.handleBlur();
    }

    handleKeyDown = (e) => {
        switch(e.key){
            case "ArrowDown":
                e.preventDefault();
                console.log('asd')
                break;
            case "ArrowUp":
                e.preventDefault();
                break;
            case "Enter":
                e.preventDefault();
                break;
            case "Escape":
                e.preventDefault();
                break;
        }
    }

    getRow = (index, option, label) => {
        return (<div key={index} className={"input-dropdown-list-option"} onClick={() => this.handleSelect(option)}>
            <p className="input-dropdown-item-title">{label ? label : option[Object.keys(option)[0]]}</p>
        </div>)
    }

    renderOptions = () => {
        const {list, mandatory, emptyText} = this.props;

        let ret = [];

        if(!mandatory){
            emptyText && ret.push(this.getRow(0, null, emptyText));
        }

        list.map((option, index) => {
            ret.push(this.getRow(index + 1, option))
        })

        return ret;
    }

    render() {
        const {
            list, rank, readonly, defaultValue, selected, align, updated, loading,
            rowId, isModal, mandatory, value, tabIndex
        } = this.props;

        return (
            <div
                tabIndex={tabIndex ? tabIndex : 0}
                onFocus={() => this.inputSearch.focus()}
                ref={(c) => this.dropdown = c}
                onBlur={this.handleBlur}
                onKeyDown={this.handleKeyDown}
                className={
                    "input-dropdown-container " +
                    (rowId ? "input-dropdown-container-static " : "") +
                    ((rowId && !isModal) ? "input-table " : "")
                }
            >
                <div className={
                    "input-dropdown input-block input-readonly input-" +
                    (rank ? rank : "secondary") +
                    (updated ? " pulse " : " ")
                }>
                    <div className={
                        "input-editable input-dropdown-focused " +
                        (align ? "text-xs-" + align + " " : "")
                    }>
                        <input
                            type="text"
                            className="input-field js-input-field font-weight-semibold"
                            readOnly
                            placeholder={defaultValue}
                            value={selected ? selected[Object.keys(selected)[0]] : ""}
                            onFocus={this.handleFocus}
                            onChange={this.handleChange}
                            ref={(c) => this.inputSearch = c}
                            disabled={readonly}
                        />
                    </div>
                    <div className="input-icon">
                        <i className="meta-icon-down-1 input-icon-sm"/>
                    </div>
                </div>
                <div className="input-dropdown-list">
                    {(list.length === 0 && loading === false) && (
                        <div className="input-dropdown-list-header">
                            There is no choice available
                        </div>
                    )}
                    {(loading && list.length === 0) && (
                        <div className="input-dropdown-list-header">
                            <ReactCSSTransitionGroup transitionName="rotate" transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
                                <div className="rotate icon-rotate">
                                    <i className="meta-icon-settings"/>
                                </div>
                            </ReactCSSTransitionGroup>
                        </div>
                    )}
                    {this.renderOptions()}
                </div>
            </div>
        )
    }
}

export default RawList;
