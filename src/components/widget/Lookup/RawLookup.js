import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import LookupList from './LookupList';

import {
    autocompleteRequest,
    dropdownRequest
} from '../../../actions/GenericActions';

import {
    getItemsByProperty,
    openModal
} from '../../../actions/WindowActions';

class RawLookup extends Component {
    constructor(props) {
        super(props);

        const {properties} = this.props;

        this.state = {
            query: '',
            list: [],
            isInputEmpty: true,
            selected: null,
            model: null,
            property: '',
            properts: {},
            loading: false,
            propertiesCopy: getItemsByProperty(properties, 'source', 'list'),
            mainProperty: getItemsByProperty(properties, 'source', 'lookup'),
            oldValue: '',
            isOpen: false,
            shouldBeFocused: true,
            validLocal: true
        }
    }

    componentDidMount() {
        const {selected} = this.props;

        this.handleValueChanged();

        if(selected) {
            this.inputSearch.value = selected[Object.keys(selected)[0]];
        }else{
            this.handleBlur(this.clearState);
        }
    }

    componentDidUpdate() {
        this.handleValueChanged();

        const {autoFocus} = this.props;
        const {isInputEmpty, shouldBeFocused} = this.state;

        if(autoFocus && isInputEmpty && shouldBeFocused){
            this.inputSearch.focus();
            this.setState({
                shouldBeFocused: false
            });
        }
    }

    handleSelect = (select) => {
        const {
            onChange, filterWidget, parameterName, subentity
        } = this.props;

        const {
            mainProperty, property
        } = this.state;

        // removing selection
        this.setState({
            selected: null
        }, () => {
            if(filterWidget) {
                onChange(parameterName, select);

                this.inputSearch.value = select[Object.keys(select)[0]];

                this.handleBlur();
            } else {
                // handling selection when main is not set or set.

                if(property === '') {
                    const promise = onChange(
                        mainProperty[0].field, select, this.getAllDropdowns
                    );

                    this.inputSearch.value = select[Object.keys(select)[0]];

                    // handle case when there is no call to Api
                    // by the cached value
                    if(!promise){
                        if(!subentity){
                            this.getAllDropdowns();
                        }
                    }else{
                        promise.then(() => {
                            if(!subentity){
                                this.getAllDropdowns();
                            }
                        }
                    )}
                } else {
                    onChange(property, select);

                    this.setState((prevState) => update(this.state, {
                        properts: {$apply: item => {
                            delete item[prevState.property];
                            return item;
                        }},
                        list: {$set: []},
                        property: {$set: ''}
                    }), () => {
                        this.generatingPropsSelection();
                    });
                }
            }
        });
    }

    getAllDropdowns = () => {
        const {
            dispatch, windowType, dataId, select, tabId, rowId, entity,
            subentity, subentityId, defaultValue, closeTableField
        } = this.props;

        const {
            propertiesCopy
        } = this.state;

        // need to have property which has no default value
        let propertiesArray = [];

        // call for more properties
        if(propertiesCopy.length > 0){
            const batchArray = propertiesCopy.filter((item, index) => {
                const objectValue = getItemsByProperty(
                    defaultValue, 'field', item.field
                )[0].value;
                if(objectValue) {
                    return false;
                } else {
                    propertiesArray.push(propertiesCopy[index]);
                    return true;
                }
            }).map((item) => {
                return dispatch(dropdownRequest(
                    windowType, item.field, dataId, tabId, rowId, entity,
                    subentity, subentityId
                ))
            });

            Promise.all(batchArray).then(props => {
                const newProps = {};
                props.map((prop, index) => {
                    if(propertiesArray.length > 0){
                        newProps[propertiesArray[index].field] =
                            prop.data.values;
                    }
                });

                this.setState({
                    properts: newProps,
                    model: select
                }, () => {
                    this.generatingPropsSelection();
                });
            });
        }else{
            this.handleBlur(closeTableField);
        }
    }

    generatingPropsSelection = () => {
        const {onChange} = this.props;
        const {properts} = this.state;
        const propertiesKeys = Object.keys(properts);

        // Chcecking properties model if there is some
        // unselected properties and handling further
        // selection
        if(propertiesKeys.length === 0){
            this.setState({
                property: ''
            });

            this.handleBlur();
            return;
        }

        for(let i=0; i < propertiesKeys.length; i++){

            if(properts[propertiesKeys[i]].length > 1){
                // Generating list of props choice
                this.setState({
                    list: properts[propertiesKeys[i]],
                    property: propertiesKeys[i]
                });
                break;
            }else{
                onChange(propertiesKeys[i], properts[propertiesKeys[i]][0]);
                this.handleBlur();
            }
        }
    }

    handleAddNew = () => {
        const {
            dispatch, newRecordWindowId, newRecordCaption, filterWidget,
            parameterName
        } = this.props;

        const {mainProperty} = this.state;

        dispatch(openModal(
            newRecordCaption, newRecordWindowId, 'window', null, null, null,
            null, null, 'NEW',
            filterWidget ? parameterName : mainProperty[0].field
        ));
    }

    handleBlur = (callback) => {
        this.setState({
            isOpen: false
        }, () => {
            if(callback){
                callback();
            }
        });
    }

    handleFocus = () => {
        const {isInputEmpty, property} = this.state;
        this.setState({
            isOpen: true
        })

        if(!isInputEmpty && property === ''){
            this.handleChange(true);
        }
    }

    handleChange = (handleChangeOnFocus) => {
        const {
            dispatch, recent, windowType, dataId, filterWidget, parameterName,
            tabId, rowId, entity, subentity, subentityId, viewId
        } = this.props;

        const {mainProperty} = this.state;

        if(this.inputSearch.value != ''){

            this.setState({
                isInputEmpty: false,
                loading: true,
                query: this.inputSearch.value,
                isOpen: true
            });

            dispatch(autocompleteRequest(
                windowType,
                (filterWidget ? parameterName : mainProperty[0].field),
                this.inputSearch.value,
                (filterWidget ? viewId : dataId), tabId, rowId, entity,
                subentity, subentityId
            )).then((response)=>{
                this.setState({
                    list: response.data.values,
                    loading: false,
                    validLocal: response.data.values.length === 0 &&
                                handleChangeOnFocus!==true ? false : true
                });
            });

        }else{
            this.setState({
                isInputEmpty: true,
                query: this.inputSearch.value,
                list: recent
            });
        }
    }

    clearState = () => {
        this.setState({
            list: [],
            isInputEmpty: true,
            selected: null,
            model: null,
            property: '',
            loading: false,
            query: ''
        });
    }

    handleClear = (e) => {
        const {onChange, properties} = this.props;
        e && e.preventDefault();
        this.inputSearch.value = '';

        onChange(properties, null, false);

        this.handleBlur(this.clearState);
    }

    handleKeyDown = (e) => {
        const {listenOnKeys, listenOnKeysFalse} = this.props;
        const {selected, list, query} = this.state;

        //need for prevent fire event onKeyDown 'Enter' from TableItem
        listenOnKeys && listenOnKeysFalse && listenOnKeysFalse();

        switch(e.key){
            case 'ArrowDown':
                e.preventDefault();
                this.navigate();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigate(true);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.handleChange();
                break;
            case 'Enter':
                e.preventDefault();
                if(selected === 'new'){
                    this.handleAddNew(query);
                }else if(selected != null){
                    this.handleSelect(list[selected]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.handleBlur();
                break;
            case 'Tab':
                this.handleBlur();
                break;
        }
    }

    navigate = (reverse) => {
        const {selected, list} = this.state;

        if(list.length === 0){
            // Case of selecting row for creting new instance
            this.setState({
                selected: 'new'
            });
        }else{
            // Case of selecting regular list items
            if(typeof selected === 'number'){
                const selectTarget = selected + (reverse ? (-1) : (1));
                if (typeof list[selectTarget] != 'undefined') {
                    this.setState({
                        selected: selectTarget
                    });
                }
            }else if(typeof list[0] != 'undefined'){
                this.setState({
                    selected: 0
                });
            }
        }
    }

    handleValueChanged = () => {
        const {defaultValue, filterWidget} = this.props;
        const {oldValue} = this.state;

        if(!filterWidget && !!defaultValue[0].value && this.inputSearch) {
            const init = defaultValue[0].value;
            const inputValue = init[Object.keys(init)[0]];

            if(inputValue !== oldValue){
                this.inputSearch.value = inputValue;

                this.setState({
                    oldValue: inputValue,
                    isInputEmpty: false,
                    validLocal: true
                });
            }

        } else if(oldValue && !defaultValue[0].value && this.inputSearch) {
            const inputEmptyValue = defaultValue[0].value;

            if(inputEmptyValue !== oldValue){
                this.inputSearch.value = inputEmptyValue;
                this.setState({
                    oldValue: inputEmptyValue,
                    isInputEmpty: true
                });
            }
        }
    }


    render() {
        const { handleAddNew, onClickOutside, disableOnClickOutside, isModal, rank, updated, filterWidget, mandatory, validStatus, align,
        creatingNewDisabled, newRecordCaption, placeholder, readonly, tabIndex} = this.props;

        const {
            propertiesCopy, isInputEmpty, list, query, loading, selected,
            isOpen, validLocal, mainProperty
        } = this.state;

        return (
        <div>
            <div className={
                    'input-dropdown input-block' 
                    
                }>
                    <div className={
                        'input-editable ' +
                        (align ? 'text-xs-' + align + ' ' : '')
                    }>
                        <input 
                            type="text"
                            className="input-field js-input-field font-weight-semibold"
                            onChange={this.handleChange}
                            onFocus={this.handleFocus}
                            ref={(c) => this.inputSearch = c}
                            placeholder={placeholder}
                            disabled={readonly}
                            tabIndex={tabIndex}
                    
                        />
                    </div>

                    
                    
                </div>
                {   isOpen && !isInputEmpty &&
                    <LookupList
                        selected={selected}
                        list={list}
                        loading={loading}
                        handleSelect={this.handleSelect}
                        handleAddNew={this.handleAddNew}
                        isInputEmpty={isInputEmpty}
                        onClickOutside={this.handleBlur}
                        disableOnClickOutside={!isOpen}
                        query={query}
                        creatingNewDisabled={isModal}
                        newRecordCaption={newRecordCaption}
                    />
                }

            </div>
            
        )
    }
}

RawLookup.propTypes = {
    dispatch: PropTypes.func.isRequired
}

RawLookup = connect()(RawLookup)

export default RawLookup
