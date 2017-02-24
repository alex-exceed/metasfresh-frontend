import React, { Component } from 'react';

import Datetime from 'react-datetime';

class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            cache: null
        }
    }

    componentDidMount() {
        const {handleBackdropLock} = this.props;
        handleBackdropLock && handleBackdropLock(true);
    }

    handleBlur = (date) => {
        const {patch, handleBackdropLock} = this.props;
        const {cache} = this.state;

        if(JSON.stringify(cache) !== (
            date !== '' ? JSON.stringify(date && date.toDate()) : ''
        )){
            patch(date);
        }

        this.handleClose();

        handleBackdropLock && handleBackdropLock(false);
    }

    handleFocus = () => {
        const {value} = this.props;
        this.setState(Object.assign({}, this.state, {
            cache: value,
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
