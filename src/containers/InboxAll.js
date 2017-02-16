import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import Header from '../components/header/Header';
import {push} from 'react-router-redux';
import Container from '../components/Container';

import InboxItem from '../components/inbox/InboxItem';
import Inbox from '../components/inbox/Inbox';

class InboxAll extends Component {
    render() {
        const {inbox} = this.props;

        return (
            <Container
                siteName = "Inbox"
            >
                <Inbox
                    all={true}
                    inbox={inbox}
                />
            </Container>
        );
    }
}

function mapStateToProps(state) {
    const { appHandler } = state;
    const {
        inbox
    } = appHandler || {
        inbox: {}
    }

    return {
        inbox
    }
}

InboxAll.propTypes = {
    dispatch: PropTypes.func.isRequired,
    inbox: PropTypes.object.isRequired
};

InboxAll = connect(mapStateToProps)(InboxAll);

export default InboxAll
