import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    patch,
    updatePropertyValue,
    openModal,
    getZoomIntoWindow
} from '../../actions/WindowActions';

import RawWidget from './RawWidget';

class MasterWidget extends Component {
    constructor(props) {
        super(props);

        this.state = {
            updated: false,
            edited: false,
            data: ''
        }
    }

    componentDidMount() {
        const {widgetData} = this.props;
        this.setState({
            data: widgetData[0].value
        });
    }

    componentWillReceiveProps(nextProps) {
        const {widgetData} = this.props;
        const {edited} = this.state;

        if(
            JSON.stringify(widgetData[0].value) !==
            JSON.stringify(nextProps.widgetData[0].value)
        ){
            this.setState({
                data: nextProps.widgetData[0].value
            });

            if(!edited) {
                this.setState({
                        updated: true
                    }, () => {
                        this.timeout = setTimeout(() => {
                            this.setState({
                                updated: false
                            })
                        }, 1000);
                    }
                )
            }else{
                this.setState({
                    edited: false
                });
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    handlePatch = (property, value) => {
        const {
            isModal, widgetType, dataId, windowType, dispatch, rowId, tabId,
            onChange, relativeDocId, isAdvanced = false, entity
        } = this.props;

        let currRowId = rowId;
        let ret = null;

        if(rowId === 'NEW'){
            currRowId = relativeDocId;
        }

        if(widgetType !== 'Button'){
            dispatch(updatePropertyValue(
                property, value, tabId, currRowId, isModal)
            );
        }

        ret = dispatch(patch(
            entity, windowType, dataId, tabId, currRowId, property, value,
            isModal, isAdvanced
        ));

        //callback
        if(onChange){
            onChange();
        }

        return ret;
    }

    //
    // This method may looks like a redundant for this one above,
    // but is need to handle controlled components if
    // they patch on other event than onchange
    //
    handleChange = (property, val) => {
        const {
            dispatch, tabId, rowId, isModal, relativeDocId, widgetType
        } = this.props;

        let currRowId = rowId;

        const dateParse = ['Date', 'DateTime', 'Time'];

        this.setState({
            edited: true,
            data: val
        }, ()=> {
            if (
                dateParse.indexOf(widgetType) === -1 &&
                !this.validatePrecision(val)
            ){ return; }
            if(rowId === 'NEW'){
                currRowId = relativeDocId;
            }
            dispatch(updatePropertyValue(
                property, val, tabId, currRowId, isModal
            ));
        });
    }

    setEditedFlag = (edited) => {
        this.setState({
            edited: edited
        });
    }

    validatePrecision = (value) => {
        const {widgetType, precision} = this.props;
        let precisionProcessed = precision;

        if(
            widgetType === 'Integer' ||
            widgetType === 'Quantity'
        ){
            precisionProcessed = 0;
        }

        if(precisionProcessed < (value.split('.')[1] || []).length){
            return false;
        }else{
            return true;
        }
    }

    handleProcess = (
        caption, buttonProcessId, tabId, rowId
    ) => {
        const {dispatch} = this.props;

        dispatch(openModal(
            caption, buttonProcessId, 'process', tabId, rowId, false, false
        ));
    }

    handleZoomInto = (field) => {
        const {dispatch, dataId, windowType, tabId, rowId} = this.props;
        dispatch(getZoomIntoWindow(
            'window', windowType, dataId, tabId, rowId, field
        )).then(res => {
             res && res.data && window.open('/window/' +
                                res.data.documentPath.windowId + '/' +
                                res.data.documentPath.documentId, '_blank');
        });
    }

    render() {
        const {
            caption, widgetType, fields, windowType, type, noLabel, widgetData,
            dataId, rowId, tabId, icon, gridAlign, isModal, entity,
            handleBackdropLock, tabIndex, dropdownOpenCallback, autoFocus,
            fullScreen, disabled, buttonProcessId, listenOnKeys,
            listenOnKeysFalse, closeTableField
        } = this.props;

        const {updated, data} = this.state;

        return (
            <RawWidget
                entity={entity}
                widgetType={widgetType}
                fields={fields}
                windowType={windowType}
                dataId={dataId}
                widgetData={widgetData}
                rowId={rowId}
                tabId={tabId}
                icon={icon}
                gridAlign={gridAlign}
                handlePatch={this.handlePatch}
                handleChange={this.handleChange}
                handleProcess={this.handleProcess}
                updated={updated}
                isModal={isModal}
                setEditedFlag={this.setEditedFlag}
                noLabel={noLabel}
                type={type}
                caption={caption}
                handleBackdropLock={handleBackdropLock}
                tabIndex={tabIndex}
                dropdownOpenCallback={dropdownOpenCallback}
                autoFocus={autoFocus}
                fullScreen={fullScreen}
                disabled={disabled}
                buttonProcessId={buttonProcessId}
                listenOnKeys={listenOnKeys}
                listenOnKeysFalse={listenOnKeysFalse}
                closeTableField={closeTableField}
                inputValue={data}
                handleZoomInto={this.handleZoomInto}
            />
        )
    }
}

MasterWidget.propTypes = {
    dispatch: PropTypes.func.isRequired
};

MasterWidget = connect()(MasterWidget)

export default MasterWidget
