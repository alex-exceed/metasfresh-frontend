import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import {
    patch,
    updateProperty,
    findRowByPropName
} from '../../actions/WindowActions';

import Datetime from 'react-datetime';
import Lookup from './Lookup';
import List from './List';
import ActionButton from './ActionButton';
import RawWidget from './RawWidget';

class Widget extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cachedValue: null,
            updated: false,
            edited: false
        }
    }

    componentWillReceiveProps(nextProps) {
        const {widgetData} = this.props;
        const {edited, editedProp} = this.state;

        if(JSON.stringify(widgetData[0].value) !== JSON.stringify(nextProps.widgetData[0].value)) {
            if(!edited) {
                this.setState(
                    Object.assign({}, this.state, {
                        updated: true
                    }), () => {
                        setTimeout(() => {
                            this.setState(Object.assign({}, this.state, {
                                updated: false
                            }))
                        }, 1000);
                    }
                )
            }else{
                this.setState(Object.assign({}, this.state, {
                    edited: false
                }));
            }
        }
    }

    handlePatch = (property, value) => {
        const {
            isModal, widgetType, widgetData, dataId, windowType, dispatch,
            rowId, tabId, onChange, relativeDocId, isAdvanced = false, entity
        } = this.props;

        const {cachedValue} = this.state;
        let currRowId = rowId;
        let ret = null;

        if(rowId === "NEW"){
            currRowId = relativeDocId;
        }

        let customWindowType = windowType;

        if(isAdvanced){
            customWindowType += "&advanced=true";
        }
        log( JSON.stringify(widgetData[0].value), JSON.stringify(value), cachedValue);


        //do patch only when value is not equal state
        //or cache is set and it is not equal value
        if( JSON.stringify(widgetData[0].value) !== JSON.stringify(value) || (cachedValue !== null && (JSON.stringify(cachedValue) !== JSON.stringify(value)))){
            log('wyslano')
            //check if we should update store
            //except button value
            if(widgetType !== "Button"){
                dispatch(updateProperty(property, value, tabId, currRowId, isModal));
            }

            ret = dispatch(patch(customWindowType, dataId, tabId, currRowId, property, value, isModal, entity));
        }

        this.setState(Object.assign({}, this.state, {
            cachedValue: null
        }));

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
            dispatch, tabId, rowId, isModal, relativeDocId, precision, widgetType
        } = this.props;

        let currRowId = rowId;

        const dateParse = ['Date', 'DateTime', 'Time'];

        this.setState(Object.assign({}, this.state, {
            edited: true
        }), () => {
            if(dateParse.indexOf(widgetType) === -1 && !this.validatePrecision(val)){
                return;
            }

            if(rowId === "NEW"){
                currRowId = relativeDocId;
            }

            dispatch(updateProperty(property, val, tabId, currRowId, isModal));

        });
    }

    setEditedFlag = (edited) => {
        this.setState(Object.assign({}, this.state, {
            edited: edited
        }));
    }

    handleFocus = (e, value) => {
        e.preventDefault();

        this.setState(Object.assign({}, this.state, {
            cachedValue: value
        }));
    }

    validatePrecision = (value) => {
        const {widgetType} = this.props;
        let {precision} = this.props;

        if(
            widgetType === "Integer" ||
            widgetType === "Quantity"
        ){
            precision = 0;
        }

        if(precision < (value.split('.')[1] || []).length){
            return false;
        }else{
            return true;
        }
    }


    render() {
        const {
            caption, widgetType, description, fields, windowType, type, noLabel,
            widgetData, dataId, rowId, tabId, icon, gridAlign, isModal, entity
        } = this.props;

        const {updated, edited} = this.state;

        if(widgetData[0].displayed && widgetData[0].displayed === true){
            return (
                <div className="form-group row">
                    <div className="col-xs-12">
                        <div className={"form-group row " + (type === "primary" ? "" : "")}>
                            {!noLabel && <div key="title" className={"form-control-label " + ((type === "primary") ? "col-sm-12 panel-title" : "col-sm-3")} title={caption}>{caption}</div>}
                            <div className={(type === "primary" || noLabel) ? "col-sm-12 " : "col-sm-9 "}>
                                <RawWidget
                                    entity={entity}
                                    widgetType={widgetType}
                                    fields={fields}
                                    windowType={windowType}
                                    dataId={dataId}
                                    type={type}
                                    widgetData={widgetData}
                                    rowId={rowId}
                                    tabId={tabId}
                                    icon={icon}
                                    gridAlign={gridAlign}
                                    handlePatch={this.handlePatch}
                                    handleChange={this.handleChange}
                                    handleFocus={this.handleFocus}
                                    updated={updated}
                                    isModal={isModal}
                                    setEditedFlag={this.setEditedFlag}
                                    test={this.test}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }else{
            return false;
        }
    }
}

Widget.propTypes = {
    dispatch: PropTypes.func.isRequired
};

Widget = connect()(Widget)

export default Widget
