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
            list: null,
            loading: false,
            selectedItem: ''
        }

        this.previousValue = '';
    }

    componentDidMount() {
        const { defaultValue } = this.props;

        if (defaultValue) {
            this.previousValue = defaultValue[Object.keys(defaultValue)[0]];
        }
    }

    componentDidUpdate(prevProps){
        const { isInputEmpty } = this.props;

        if (isInputEmpty && (prevProps.isInputEmpty !== isInputEmpty)) {
            this.previousValue = '';
        }
    }

    requestListData = (forceSelection = false, forceFocus = false) => {
        const {
            properties, dataId, rowId, tabId, windowType,
            filterWidget, entity, subentity, subentityId, viewId, attribute
        } = this.props;

        this.setState({
            loading: true
        });

        dropdownRequest(
            windowType,
            filterWidget ? properties[0].parameterName : properties[0].field,
            dataId, tabId, rowId, entity, subentity, subentityId, viewId,
            attribute
        ).then( (res) => {
            let values = res.data.values;

            if (forceSelection && values && (values.length === 1)) {
                let value = values[0];

                this.previousValue = '';

                this.setState({
                    list: values,
                    loading: false
                });

                this.handleSelect(value);
            }
            else {
                this.setState({
                    list: values,
                    loading: false
                });
            }

            if (forceFocus && values && (values.length > 1)) {
                this.focus();
            }
        });
    }

    handleFocus = () => {
        if (this.state && !this.state.list && !this.state.loading) {
            this.requestListData();
        }
    }

    focus = () => {
        if (this.rawList) {
            this.rawList.focus();
        }
    }

    activate = () => {
        if (this.state.list && this.state.list.length > 1) {
            this.focus();
        }
    }

    handleSelect = (option) => {
        const {
            onChange, lookupList, properties, setNextProperty, mainProperty,
            enableAutofocus
        } = this.props;

        enableAutofocus();

        let optionKey = option && Object.keys(option)[0];
        if (this.previousValue !== (option && option[optionKey] )) {
             if (lookupList) {
                const promise = onChange(properties[0].field, option);

                if (option) {
                    this.setState({
                        selectedItem: option
                    });

                    this.previousValue = option[optionKey];
                }

                if (promise) {
                    promise.then(()=> {
                        setNextProperty(mainProperty[0].field);
                    })
                } else {
                    setNextProperty(mainProperty[0].field);
                }
            } else {
                onChange(option);
            }
         }
    }

    render() {
        const {
            rank, readonly, defaultValue, selected, align, updated, rowId,
            emptyText, tabIndex, mandatory, validStatus, lookupList, autofocus,
            blur, initialFocus, lastProperty, disableAutofocus
        } = this.props;

        const { list, loading, selectedItem } = this.state;

        return (
            <RawList
                ref={ (c) => this.rawList = c }
                loading={loading}
                list={list || []}
                lookupList={lookupList}
                rank={rank}
                readonly={readonly}
                defaultValue={defaultValue}
                selected={lookupList ? selectedItem : selected}
                align={align}
                updated={updated}
                rowId={rowId}
                emptyText={emptyText}
                mandatory={mandatory}
                validStatus={validStatus}
                tabIndex={tabIndex}
                autofocus={autofocus}
                initialFocus={initialFocus}
                lastProperty={lastProperty}
                disableAutofocus={disableAutofocus}
                blur={blur}
                onRequestListData={this.requestListData}
                onFocus={this.handleFocus}
                onSelect={option => this.handleSelect(option)}
            />
        )
    }
}

List.propTypes = {
    dispatch: PropTypes.func.isRequired
};

List = connect(false, false, false, { withRef: true })(List);

export default List
