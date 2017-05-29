import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RawList from './RawList';

import {
    dropdownRequest
} from '../../../actions/GenericActions';

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loading: false
        }
    }

    handleFocus = () => {
        const {
            properties, dispatch, dataId, rowId, tabId, windowType,
            filterWidget, entity, subentity, subentityId, viewId, attribute
        } = this.props;

        this.setState({
            loading: true
        });

        dispatch(dropdownRequest(
            windowType,
            filterWidget ? properties[0].parameterName: properties[0].field,
            dataId, tabId, rowId, entity, subentity, subentityId, viewId,
            attribute
        )).then((res) => {
            this.setState({
                list: res.data.values,
                loading: false
            });
        });
    }

    handleSelect = (option) => {
        const {onChange} = this.props;
        onChange(option);
    }

    render() {
        const {
            rank, readonly, defaultValue, selected, align, updated, rowId,
            emptyText, tabIndex, mandatory, validStatus
        } = this.props;
        const {list, loading} = this.state;

        return (
            <RawList
                list={list}
                loading={loading}
                onFocus={this.handleFocus}
                onSelect={option => this.handleSelect(option)}
                rank={rank}
                readonly={readonly}
                defaultValue={defaultValue}
                selected={selected}
                align={align}
                updated={updated}
                rowId={rowId}
                emptyText={emptyText}
                tabIndex={tabIndex}
                mandatory={mandatory}
                validStatus={validStatus}
            />
        )
    }
}

List.propTypes = {
    dispatch: PropTypes.func.isRequired
};

List = connect()(List)

export default List
