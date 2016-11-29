import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';

import Datetime from 'react-datetime';

class DatePicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        }
    }

    handleBlur = (date) => {
        const {patch} = this.props;

        this.handleClose();
        patch(date);
    }

    handleFocus = () => {
        this.setState(Object.assign({}, this.state, {
            open: true
        }));
    }

    handleClose = () => {
        this.setState(Object.assign({}, this.state, {
            open: false
        }));
    }

    handleClickOutside = () => {
		this.handleClose();
	}

    renderDay = (props, currentDate) => {
        return (
            <td
                {...props}
                onDoubleClick={() => this.handleClose()}
            >
                {currentDate.date()}
            </td>
        );
    }

    render() {
        const {open} = this.state;

        return (<Datetime
            closeOnTab={true}
            renderDay={this.renderDay}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            {...this.props}
        />)
    }
}


export default DatePicker
