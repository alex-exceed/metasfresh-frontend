import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { push } from 'react-router-redux';

import {
    closeRawModal
} from '../../actions/WindowActions';

class RawModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scrolled: false
        }
    }

    componentDidMount() {
        // Dirty solution, but use only if you need to
        // there is no way to affect body
        // because body is out of react app range
        // and css dont affect parents
        // but we have to change scope of scrollbar
        document.body.style.overflow = "hidden";

        const modalContent = document.querySelector('.js-panel-modal-content')

        modalContent && modalContent.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        const modalContent = document.querySelector('.js-panel-modal-content');

        modalContent && modalContent.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = (event) => {
        const scrollTop = event.srcElement.scrollTop;

        this.setState({
            scrolled: scrollTop > 0
        })
    }

    handleClose = () => {
        const {dispatch, closeCallback, modalType} = this.props;
        const {isNew} = this.state;

        closeCallback && closeCallback(isNew);
        this.removeModal();
    }

    removeModal = () => {
        const {dispatch} = this.props;

        dispatch(closeRawModal());
        document.body.style.overflow = "auto";
    }


    render() {
        const {
            modalTitle, dataId, modalType, windowType, children
        } = this.props;

        const {
            scrolled
        } = this.state;

        return (
            <div
                className="screen-freeze js-not-unselect"
            >
                <div className="panel panel-modal panel-modal-primary">
                    <div
                        className={
                            "panel-modal-header " +
                            (scrolled ? "header-shadow": "")
                        }
                    >
                        <span className="panel-modal-header-title">
                            {modalTitle ? modalTitle : "Modal"}
                        </span>
                        <div className="items-row-2">
                            <button
                                className="btn btn-meta-outline-secondary btn-distance-3 btn-md"
                                onClick={this.handleClose}
                                tabIndex={0}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                    <div
                        className="panel-modal-content js-panel-modal-content container-fluid"
                        ref={c => { c && c.focus()}}
                    >
                        {children}
                    </div>
                </div>
            </div>
        )
    }
}

RawModal.propTypes = {
    dispatch: PropTypes.func.isRequired
};

RawModal = connect()(RawModal)

export default RawModal
