import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
    quickActionsRequest
} from '../../actions/ListActions';

import {
    openModal
} from '../../actions/WindowActions';

import QuickActionsDropdown from './QuickActionsDropdown';

import keymap from '../../keymap.js';
import QuickActionsContextShortcuts
    from '../shortcuts/QuickActionsContextShortcuts';
import { ShortcutManager } from 'react-shortcuts';
const shortcutManager = new ShortcutManager(keymap);

class QuickActions extends Component {
    constructor(props){
        super(props);

        this.state = {
            actions: [],
            isDropdownOpen: false
        }

        const {fetchOnInit} = this.props;

        if(fetchOnInit){
            this.fetchActions();
        }
    }

    componentDidMount = () => {
        this.mounted = true;
    }

    componentWillUnmount = () => {
        this.mounted = false;
    }

    componentDidUpdate = (prevProps) => {
        const {selected, refresh, shouldNotUpdate, viewId} = this.props;
        if(shouldNotUpdate){
            return;
        }

        if(
            (JSON.stringify(prevProps.selected) !== JSON.stringify(selected)) ||
            (JSON.stringify(prevProps.refresh) !== JSON.stringify(refresh)) ||
            (JSON.stringify(prevProps.viewId) !== JSON.stringify(viewId))
        ){
            this.fetchActions();
        }
    }

    getChildContext = () => {
        return { shortcuts: shortcutManager }
    }

    handleClickOutside = () => {
        this.toggleDropdown();
    }

    handleClick = (action) => {
        const {dispatch, viewId, selected} = this.props;

        if(action.disabled){
            return;
        }

        dispatch(
            openModal(
                action.caption, action.processId, 'process', null, null, false,
                viewId, selected
            )
        );
        
        this.toggleDropdown();
    }

    fetchActions = () => {
        const {dispatch, windowType, viewId, selected} = this.props;
        dispatch(
            quickActionsRequest(windowType, viewId, selected)
        ).then(response => {
            this.mounted && this.setState({
                actions: response.data.actions
            })
        });
    }

    toggleDropdown = (option) => {
        this.setState({
            isDropdownOpen: option
        })
    }

    render() {
        const {
            actions, isDropdownOpen
        } = this.state;

        const {shouldNotUpdate, processStatus} = this.props;

        if(actions.length){
            return (
                <div className="js-not-unselect">
                    <span className="spacer-right">Actions:</span>
                    <div className="quick-actions-wrapper">
                        <div
                            className={
                                'tag tag-success tag-xlg spacer-right ' +
                                'quick-actions-tag ' +
                                ((actions[0].disabled ||
                                    processStatus === 'pending') ?
                                        'tag-default ' : 'pointer '
                                )
                            }
                            onClick={() => this.handleClick(actions[0])}
                            title={actions[0].caption}
                        >
                            {actions[0].caption}
                        </div>
                        <div
                            className={
                                'btn-meta-outline-secondary btn-icon-sm ' +
                                'btn-inline btn-icon pointer ' +
                                (isDropdownOpen ? 'btn-disabled ' : '')
                            }
                            onClick={() => this.toggleDropdown(!isDropdownOpen)}
                        >
                            <i className="meta-icon-down-1" />
                        </div>

                        {isDropdownOpen &&
                            <QuickActionsDropdown
                                actions={actions}
                                handleClick={this.handleClick}
                                handleClickOutside={() =>
                                    this.toggleDropdown(false)
                                }
                                disableOnClickOutside={!isDropdownOpen}
                            />
                        }
                    </div>
                    <QuickActionsContextShortcuts
                        handleClick={() => shouldNotUpdate ?
                            null : this.handleClick(actions[0])
                        }
                    />
                </div>
            );
        }else{
            return false;
        }
    }
}

QuickActions.childContextTypes = {
    shortcuts: PropTypes.object.isRequired
}

QuickActions.propTypes = {
    dispatch: PropTypes.func.isRequired
};

QuickActions = connect()(QuickActions)

export default QuickActions;
