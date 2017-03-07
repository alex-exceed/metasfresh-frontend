import React, { Component } from 'react';
import Moment from 'moment';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import DatePicker from './DatePicker';
import Attributes from './Attributes/Attributes';
import Lookup from './Lookup/Lookup';
import DatetimeRange from './DatetimeRange';
import List from './List/List';
import ActionButton from './ActionButton';
import Image from './Image';
import DevicesWidget from './Devices/DevicesWidget';

import {DATE_FORMAT}  from '../../constants/Constants';

class RawWidget extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isEdited: false,
            cachedValue: null,
            errorPopup: false
        }
    }

    componentDidMount(){
        const {autoFocus} = this.props
        if(this.rawWidget && autoFocus){
            this.rawWidget.focus();
        }
    }

    handleFocus = (e) => {
        const {handleFocus} = this.props;

        this.setState({
            isEdited: true,
            cachedValue: e.target.value
        });

        handleFocus && handleFocus();
    }

    handlePatch = (property, value, id, valueTo) => {
        const {handlePatch, widgetData} = this.props;
        const {cachedValue} = this.state;
        let ret = null;

        // Do patch only when value is not equal state
        // or cache is set and it is not equal value

        if(
            JSON.stringify(widgetData[0].value) !== JSON.stringify(value) ||
            JSON.stringify(widgetData[0].valueTo) !== JSON.stringify(valueTo) ||
            (cachedValue !== null &&
                (JSON.stringify(cachedValue) !== JSON.stringify(value)))
        ){

            if(handlePatch) {
                ret = handlePatch(property, value, id, valueTo);
            }
        }

        if(ret){
            this.setState({
                cachedValue: null
            });
        }

        return ret;
    }

    handleBlur = (widgetField, value, id) => {
        const {handleBlur} = this.props;

        handleBlur && handleBlur();

        this.setState({
            isEdited: false
        });

        this.handlePatch(widgetField, value, id);
    }

    handleProcess = () => {
        const {
            handleProcess, buttonProcessId, tabId, rowId, dataId, windowType,
            caption
        } = this.props;

        handleProcess && handleProcess(
            caption, buttonProcessId, tabId, rowId, dataId, windowType
        );
    }

    handleErrorPopup = (value) => {
        this.setState({
            errorPopup: value
        })
    }

    getClassnames = (icon) => {
        const {
            widgetData, disabled, gridAlign, type, updated, rowId, isModal
        } = this.props;

        const {isEdited} = this.state;
        
        return 'input-block ' +
            (icon ? 'input-icon-container ' : '') +
            (widgetData[0].readonly || disabled ? 'input-disabled ' : '') +
            ((widgetData[0].mandatory &&
                ((widgetData[0].value &&
                widgetData[0].value.length === 0) || !widgetData[0].value)) ? 'input-mandatory ' : '') +
            ((widgetData[0].validStatus &&
                (
                    !widgetData[0].validStatus.valid &&
                    !widgetData[0].validStatus.initialValue
                ) &&
                !isEdited) ? 'input-error ' : '') +
            (gridAlign ? 'text-xs-' + gridAlign + ' ' : '') +
            (type === 'primary' ? 'input-primary ' : 'input-secondary ') +
            (updated ? 'pulse-on ' : 'pulse-off ') +
            (rowId && !isModal ? 'input-table ' : '');
    }

    renderErrorPopup = (reason) => {
        return (
            <div className="input-error-popup">
                {reason ? reason : 'Input error'}
            </div>
        )
    }

    renderWidget = () => {
        const {
            handleChange, updated, isModal, filterWidget, filterId, id, range,
            onHide, handleBackdropLock, subentity, subentityId, tabIndex,
            dropdownOpenCallback, autoFocus, fullScreen, widgetType, fields,
            windowType, dataId, type, widgetData, rowId, tabId, icon, gridAlign,
            entity, onShow, disabled, caption, viewId
        } = this.props;

        const {isEdited} = this.state;

        // TODO: API SHOULD RETURN THE SAME PROPERTIES FOR FILTERS
        const widgetField = filterWidget ?
            fields[0].parameterName : fields[0].field;

        switch(widgetType){
            case 'Date':
                if(range){
                    // Watch out! The datetimerange widget as exception,
                    // is non-controlled input! For further usage, needs
                    // upgrade.
                    return (
                        <DatetimeRange
                            onChange={(value, valueTo) =>
                                this.handlePatch(widgetField,
                                    value ?
                                        Moment(value).format(DATE_FORMAT) :
                                        null,
                                    null,
                                    valueTo ?
                                        Moment(valueTo).format(DATE_FORMAT) :
                                        null
                                )
                            }
                            mandatory={widgetData[0].mandatory}
                            validStatus={widgetData[0].validStatus}
                            onShow={onShow}
                            onHide={onHide}
                            value={widgetData[0].value}
                            valueTo={widgetData[0].valueTo}
                            tabIndex={fullScreen ? -1 : tabIndex}
                         />
                    )
                }else{
                    return (
                        <div className={this.getClassnames(true)}>
                            <DatePicker
                                ref={c => this.rawWidget = c}
                                timeFormat={false}
                                dateFormat={true}
                                inputProps={{
                                    placeholder: fields[0].emptyText,
                                    disabled:
                                        widgetData[0].readonly || disabled,
                                    tabIndex: fullScreen ? -1 : tabIndex
                                }}
                                value={widgetData[0].value}
                                onChange={(date) =>
                                    handleChange(widgetField, date)}
                                patch={(date) => this.handlePatch(
                                    widgetField,
                                    date ?
                                        Moment(date).format(DATE_FORMAT) : null
                                )}
                                handleBackdropLock={handleBackdropLock}
                            />
                            <i
                                className="meta-icon-calendar input-icon-right"
                            />
                        </div>
                    )
                }
            case 'DateTime':
                return (
                    <div className={this.getClassnames(true)}>
                        <DatePicker
                            ref={c => this.rawWidget = c}
                            timeFormat={true}
                            dateFormat={true}
                            inputProps={{
                                placeholder: fields[0].emptyText,
                                disabled: widgetData[0].readonly || disabled,
                                tabIndex: fullScreen ? -1 : tabIndex
                            }}
                            value={widgetData[0].value}
                            onChange={(date) => handleChange(widgetField, date)}
                            patch={(date) => this.handlePatch(widgetField,
                                date ? Moment(date).format(DATE_FORMAT) : null
                            )}
                            tabIndex={fullScreen ? -1 : tabIndex}
                            handleBackdropLock={handleBackdropLock}
                        />
                        <i className="meta-icon-calendar input-icon-right"></i>
                    </div>
                )
            case 'Time':
                return (
                    <div className={this.getClassnames(true)}>
                        <DatePicker
                            ref={c => this.rawWidget = c}
                            timeFormat={true}
                            dateFormat={false}
                            inputProps={{
                                placeholder: fields[0].emptyText,
                                disabled: widgetData[0].readonly || disabled,
                                tabIndex: fullScreen ? -1 : tabIndex
                            }}
                            value={widgetData[0].value}
                            onChange={(date) => handleChange(widgetField, date)}
                            patch={(date) => this.handlePatch(widgetField,
                                date ? Moment(date).format(DATE_FORMAT) : null
                            )}
                            tabIndex={fullScreen ? -1 : tabIndex}
                            handleBackdropLock={handleBackdropLock}
                        />
                        <i className="meta-icon-calendar input-icon-right"></i>
                    </div>
                )
            case 'Lookup':
                return (
                    <Lookup
                        entity={entity}
                        subentity={subentity}
                        subentityId={subentityId}
                        recent={[]}
                        dataId={dataId}
                        properties={fields}
                        windowType={windowType}
                        defaultValue={widgetData}
                        placeholder={fields[0].emptyText}
                        readonly={widgetData[0].readonly || disabled}
                        mandatory={widgetData[0].mandatory}
                        rank={type}
                        onChange={this.handlePatch}
                        align={gridAlign}
                        isModal={isModal}
                        updated={updated}
                        filterWidget={filterWidget}
                        filterId={filterId}
                        parameterName={fields[0].parameterName}
                        selected={widgetData[0].value}
                        tabId={tabId}
                        rowId={rowId}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        viewId={viewId}
                        autoFocus={autoFocus}
                        validStatus={widgetData[0].validStatus}
                        newRecordCaption={fields[0].newRecordCaption}
                        newRecordWindowId={fields[0].newRecordWindowId}
                    />
                )
            case 'List':
                return (
                    <List
                        dataId={dataId}
                        entity={entity}
                        subentity={subentity}
                        subentityId={subentityId}
                        defaultValue={fields[0].emptyText}
                        selected={widgetData[0].value}
                        properties={fields}
                        readonly={widgetData[0].readonly || disabled}
                        mandatory={widgetData[0].mandatory}
                        windowType={windowType}
                        rowId={rowId}
                        tabId={tabId}
                        onChange={(option) => this.handlePatch(widgetField, option, id)}
                        align={gridAlign}
                        updated={updated}
                        filterWidget={filterWidget}
                        filterId={filterId}
                        parameterName={fields[0].parameterName}
                        emptyText={fields[0].emptyText}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        viewId={viewId}
                        autoFocus={autoFocus}
                        validStatus={widgetData[0].validStatus}
                    />
                )
            case 'Text':
                return (
                    <div className={
                            this.getClassnames(true) +
                            (isEdited ? 'input-focused ' : '')
                        }
                    >
                        <input
                            type="text"
                            ref={c => this.rawWidget = c}
                            className="input-field js-input-field"
                            value={widgetData[0].value}
                            placeholder={fields[0].emptyText}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) => handleChange && handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                        {icon && <i className="meta-icon-edit input-icon-right"></i>}
                    </div>
                )
            case 'LongText':
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <textarea
                            ref={c => this.rawWidget = c}
                            className="input-field js-input-field"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            placeholder={fields[0].emptyText}
                            onFocus={this.handleFocus}
                            onChange={(e) => handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'Integer':
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <input
                            ref={c => this.rawWidget = c}
                            type="number"
                            className="input-field js-input-field"
                            min="0"
                            step="1"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) => handleChange && handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'Number':
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <input
                            ref={c => this.rawWidget = c}
                            type="number"
                            className="input-field js-input-field"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) => handleChange && handleChange(fields[0].field, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'Amount' :
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <input
                            ref={c => this.rawWidget = c}
                            type="number"
                            className="input-field js-input-field"
                            min="0"
                            step="1"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) =>  handleChange && handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'Quantity':
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <input
                            ref={c => this.rawWidget = c}
                            type="number"
                            className="input-field js-input-field"
                            min="0"
                            step="1"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) =>  handleChange && handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'CostPrice':
                return (
                    <div className={
                        this.getClassnames() +
                        (isEdited ? 'input-focused ' : '')
                    }>
                        <input
                            ref={c => this.rawWidget = c}
                            type="number"
                            className="input-field js-input-field"
                            value={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onFocus={this.handleFocus}
                            onChange={(e) =>  handleChange && handleChange(widgetField, e.target.value)}
                            onBlur={(e) => this.handleBlur(widgetField, e.target.value, id)}
                            tabIndex={fullScreen ? -1 : tabIndex}
                        />
                    </div>
                )
            case 'YesNo':
                return (
                    <label
                        className={
                            'input-checkbox ' +
                            (widgetData[0].readonly || disabled ? 'input-disabled ' : '')
                        }
                        tabIndex={fullScreen ? -1 : tabIndex}
                        ref={c => this.rawWidget = c}
                        onKeyDown={e => {
                            if(e.key === ' '){
                                e.preventDefault();
                                this.checkbox.click();
                            }
                        }}
                    >
                        <input
                            ref={c => this.rawWidget = c}
                            type="checkbox"
                            checked={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            onChange={(e) => this.handlePatch(widgetField, e.target.checked, id)}
                            tabIndex="-1"
                        />
                        <div className="input-checkbox-tick" />
                    </label>
                )
            case 'Switch':
                return (
                    <label
                        className={
                            'input-switch ' +
                            (widgetData[0].readonly || disabled ?
                                'input-disabled ' : '') +
                            (widgetData[0].mandatory &&
                                widgetData[0].value.length === 0 ?
                                    'input-mandatory ' : '') +
                            (widgetData[0].validStatus &&
                                !widgetData[0].validStatus.valid ?
                                'input-error ' : '') +
                            (rowId && !isModal ? 'input-table ' : '')
                        }
                        tabIndex={fullScreen ? -1 : tabIndex}
                        ref={c => this.rawWidget = c}
                        onKeyDown={e => {e.key === ' ' &&
                            this.handlePatch(
                                widgetField, !widgetData[0].value, id
                            )
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={widgetData[0].value}
                            disabled={widgetData[0].readonly || disabled}
                            tabIndex="-1"
                            onChange={(e) => this.handlePatch(widgetField, e.target.checked, id)}
                        />
                        <div className="input-slider" />
                    </label>
                )
            case 'Label':
                return (
                    <div
                        className={
                            'tag tag-warning ' +
                            (gridAlign ? 'text-xs-' + gridAlign + ' ' : '')
                        }
                        tabIndex={fullScreen ? -1 : tabIndex}
                        ref={c => this.rawWidget = c}
                    >
                        {widgetData[0].value}
                    </div>
                )
            case 'Button':
                return (
                    <button
                        className={
                            'btn btn-sm btn-meta-primary ' +
                            (gridAlign ? 'text-xs-' + gridAlign + ' ' : '') +
                            (widgetData[0].readonly || disabled ? 'tag-disabled disabled ' : '')
                        }
                        onClick={() => this.handlePatch(widgetField)}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        ref={c => this.rawWidget = c}
                    >
                        {widgetData[0].value[Object.keys(widgetData[0].value)[0]]}
                    </button>
                )
            case 'ProcessButton':
                return (
                    <button
                        className={
                            'btn btn-sm btn-meta-primary ' +
                            (gridAlign ? 'text-xs-' + gridAlign + ' ' : '') +
                            (widgetData[0].readonly || disabled ? 'tag-disabled disabled ' : '')
                        }
                        onClick={this.handleProcess}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        ref={c => this.rawWidget = c}
                    >
                        {caption}
                    </button>
                )
            case 'ActionButton':
                return (
                    <ActionButton
                        data={widgetData[0]}
                        windowType={windowType}
                        fields={fields}
                        dataId={dataId}
                        onChange={(option) => this.handlePatch(fields[1].field, option)}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        dropdownOpenCallback={dropdownOpenCallback}
                        ref={c => this.rawWidget = c}
                    />
                )
            case 'ProductAttributes':
                return (
                    <Attributes
                        attributeType="pattribute"
                        fields={fields}
                        dataId={dataId}
                        widgetData={widgetData[0]}
                        docType={windowType}
                        tabId={tabId}
                        rowId={rowId}
                        fieldName={widgetField}
                        handleBackdropLock={handleBackdropLock}
                        patch={(option) => this.handlePatch(widgetField, option)}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        autoFocus={autoFocus}
                        readonly={widgetData[0].readonly || disabled}
                    />
                )
            case 'Address':
                return (
                    <Attributes
                        attributeType="address"
                        fields={fields}
                        dataId={dataId}
                        widgetData={widgetData[0]}
                        docType={windowType}
                        tabId={tabId}
                        rowId={rowId}
                        fieldName={widgetField}
                        handleBackdropLock={handleBackdropLock}
                        patch={(option) => this.handlePatch(widgetField, option)}
                        tabIndex={fullScreen ? -1 : tabIndex}
                        autoFocus={autoFocus}
                        readonly={widgetData[0].readonly || disabled}
                    />
                )
            case 'Image':
                return <Image
                    fields={fields}
                    data={widgetData[0]}
                    handlePatch={this.handlePatch}
                />;
            default:
                return false;
        }
    }

    render() {
        const {
            caption, fields, type, noLabel, widgetData, rowId, isModal, handlePatch,
            widgetType
        } = this.props;

        const {errorPopup} = this.state;
        const widgetBody = this.renderWidget();
        const {validStatus} = widgetData[0];

        // Unsupported widget type
        if(!widgetBody){
            console.warn(
                'The %c' + widgetType,
                'font-weight:bold;',
                'is unsupported type of widget.'
            );

            return false;
        }

        // No display value or not displayed
        if(!widgetData[0].displayed || widgetData[0].displayed !== true){
            return false;
        }

        return (
            <div className={
                'form-group row ' +
                ((rowId && !isModal) ? 'form-group-table ' : ' ')
            }>
                {(!noLabel && caption) &&
                    <div
                        key="title"
                        className={
                            'form-control-label ' +
                            ((type === 'primary') ? 'col-sm-12 panel-title' : 'col-sm-3')
                        }
                        title={caption}
                    >
                        {caption}
                    </div>
                }
                <div
                    className={
                        ((type === 'primary' || noLabel) ? 'col-sm-12 ' : 'col-sm-9 ') +
                        (fields[0].devices ? 'form-group-flex ': '')
                    }
                    onMouseEnter={() => this.handleErrorPopup(true)}
                    onMouseLeave={() => this.handleErrorPopup(false)}
                >
                    <div className="input-body-container">
                        <ReactCSSTransitionGroup
                            transitionName="fade"
                            transitionEnterTimeout={200}
                            transitionLeaveTimeout={200}
                        >
                            {(
                                errorPopup && validStatus && 
                                !validStatus.valid && 
                                !widgetData[0].validStatus.initialValue
                            ) &&
                                this.renderErrorPopup(validStatus.reason)
                            }
                        </ReactCSSTransitionGroup>
                        {widgetBody}
                    </div>
                    {fields[0].devices && !widgetData[0].readonly &&
                        <DevicesWidget
                            devices={fields[0].devices}
                            tabIndex={1}
                            handleChange={(value) =>
                                handlePatch && handlePatch(fields[0].field, value)
                            }
                        />
                    }
                </div>
            </div>
        )
    }
}

export default RawWidget;
