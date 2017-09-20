import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TableCell from './TableCell';

// Widgets IDs which allowed to be edited in field edit mode
const FIELD_EDIT_WIDGET_TYPES = [
    'CostPrice'
];

class TableItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edited: '',
            activeCell: '',
            updatedRow: false,
            listenOnKeys: true
        };
    }

    handleEditProperty = (e, property, callback, item) => {
        const { activeCell } = this.state;
        const elem = document.activeElement;

        if(activeCell !== elem && !elem.className.includes('js-input-field')) {
            this.setState({
                activeCell: elem
            })
        }

        this.editProperty(e, property, callback, item);
    }

    prepareWidgetData = (item) => {
        const { fieldsByName } = this.props;

        let widgetData = item.fields.map( (prop) => fieldsByName[prop.field] );

        return widgetData;
    }

    initPropertyEditor = (fieldName) => {
        const { cols, fieldsByName } = this.props;

        if (cols && fieldsByName) {
            cols.map((item) => {
                const property = item.fields[0].field;
                if (property === fieldName) {
                    const widgetData = this.prepareWidgetData(item);

                    if (widgetData) {
                        this.setState({
                            forceKeysBind: true
                        }, () => {
                            this.handleEditProperty(
                                null, property, true, widgetData[0]
                            );
                        });
                    }
                }
            });
        }
    }

    editProperty = (e, property, callback, item) => {
        const { changeListenOnTrue, changeListenOnFalse } = this.props;

        if( item ? !item.readonly : true ) {
            this.setState({
                edited: property
            }, ()=>{
                if(callback){
                    const elem =
                        document
                            .activeElement
                            .getElementsByClassName('js-input-field')[0];

                    if(elem){
                        elem.select();
                    }

                    const disabled =
                        document.activeElement.querySelector('.input-disabled');
                    const readonly =
                        document.activeElement.querySelector('.input-readonly');

                    if(disabled || readonly) {
                        changeListenOnTrue();
                        this.handleEditProperty(e);

                    } else {
                        changeListenOnFalse();
                    }
                }
            })
        }
    }

    listenOnKeysTrue = () => {
        this.setState({
            listenOnKeys: true
        });
    }

    listenOnKeysFalse = () => {
        this.setState({
            listenOnKeys: false
        });
    }

    handleKey = (e, property) => {
        const { edited, listenOnKeys} = this.state;
        if(listenOnKeys){
            if(e.key === 'Enter' && !edited) {
                this.handleEditProperty(e, property, true);
            } else if (e.key === 'Enter' && edited) {
                this.closeTableField(e);
            }
        }
    }

    closeTableField = (e) => {
        const { changeListenOnTrue } = this.props;
        const {activeCell} = this.state;

        this.handleEditProperty(e);
        this.listenOnKeysTrue();

        changeListenOnTrue();

        activeCell && activeCell.focus();
    }

    isAllowedFieldEdit = (item) => {
        return FIELD_EDIT_WIDGET_TYPES.indexOf(item.widgetType) > -1;
    }

    renderCells = (cols, cells) => {
        const {
            type, docId, rowId, tabId, readonly, mainTable, newRow,
            changeListenOnTrue, tabIndex, entity, getSizeClass,
            handleRightClick, caption, colspan, onItemChange
        } = this.props;

        const {
            edited, updatedRow, listenOnKeys, forceKeysBind
        } = this.state;

        // Iterate over layout settings

        if (colspan) {
            return (
                <td colSpan={cols.length}>
                    {caption}
                </td>
            )
        } else {
            return cols && cols.map((item, index) => {
                const {supportZoomInto} = item.fields[0];
                const supportFieldEdit = mainTable &&
                    this.isAllowedFieldEdit(item);

                const property = item.fields[0].field;
                let widgetData = item.fields.map(
                    (prop) => {
                        if (cells) {
                            let cellWidget = cells[prop.field] || -1;

                            if (
                                supportFieldEdit &&
                                typeof cellWidget === 'object'
                            ) {
                                cellWidget = Object.assign({}, cellWidget, {
                                    widgetType: item.widgetType,
                                    displayed: true,
                                    mandatory: true,
                                    readonly: false
                                });
                            }

                            return cellWidget;
                        }

                        return -1;
                    }
                );

                return (
                    <TableCell
                        {...{getSizeClass, entity, type, docId, rowId,
                            tabId, item, readonly, widgetData, tabIndex,
                            listenOnKeys, caption, mainTable
                        }}
                        key={index}
                        isEdited={edited === property}
                        onDoubleClick={(e) =>
                            this.handleEditProperty(
                                e, property, true, widgetData[0]
                            )
                        }
                        onClickOutside={(e) => {
                            this.handleEditProperty(e);
                            changeListenOnTrue();
                        }}
                        disableOnClickOutside={edited !== property}
                        onKeyDown = {(!mainTable || forceKeysBind) ?
                            (e) => this.handleKey(e, property) : ''
                        }
                        onCellChange={onItemChange}
                        updatedRow={updatedRow || newRow}
                        updateRow={this.updateRow}
                        listenOnKeysFalse={this.listenOnKeysFalse}
                        closeTableField={(e) => this.closeTableField(e)}
                        handleRightClick={(e) => handleRightClick(
                            e, property, supportZoomInto, supportFieldEdit
                        )}
                    />
                )
            })
        }
    }

    updateRow = () => {
        this.setState({
                updatedRow: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        updatedRow: false
                    })
                }, 1000);
            }
        )
    }

    nestedSelect = (elem, cb) => {
        let res = [];

        elem && elem.map(item => {
            res = res.concat([item.id]);

            if(item.includedDocuments){
                res = res.concat(this.nestedSelect(item.includedDocuments));
            }else{
                cb && cb();
            }
        })

        return res;
    }

    handleIndentSelect = (e, id, elem) => {
        const {handleSelect} = this.props;
        e.stopPropagation();
        handleSelect(this.nestedSelect(elem).concat([id]));
    }

    getIconClassName = (huType) => {
        switch(huType){
            case 'LU':
                return 'meta-icon-pallete';
            case 'TU':
                return 'meta-icon-package';
            case 'CU':
                return 'meta-icon-product';
            case 'PP_Order_Receive':
                return 'meta-icon-receipt';
            case 'PP_Order_Issue':
                return 'meta-icon-issue';
            case 'M_Picking_Slot':
                return 'meta-icon-beschaffung';	// https://github.com/metasfresh/metasfresh/issues/2298
        }
    }

    renderTree = (huType) => {
        const {
            indent, lastChild, includedDocuments, rowId,
            collapsed, handleRowCollapse, collapsible
        } = this.props;

        let indentation = [];

        for(let i = 0; i < indent.length; i++){
            indentation.push(
                <div
                    key={i}
                    className={
                        'indent-item-mid ' +
                        (collapsible ? 'indent-collapsible-item-mid ' : '')
                    }
                >
                    {i === indent.length - 1 && <div className="indent-mid"/>}
                    <div
                        className={
                            (indent[i] ? 'indent-sign ' : '') +
                            ((lastChild && i === indent.length - 1) ?
                                'indent-sign-bot ' : ''
                            )
                        }
                    />
                </div>
            )
        }

        return (
            <div className={'indent'}>
                {indentation}
                {includedDocuments && !collapsed &&
                    <div
                        className={
                            'indent-bot ' +
                            (collapsible ? 'indent-collapsible-bot ' : '')
                        }
                    />
                }
                {includedDocuments && collapsible ? (collapsed ?
                        <i
                            onClick={handleRowCollapse}
                            className="meta-icon-plus indent-collapse-icon" /> :
                        <i
                            onClick={handleRowCollapse}
                            className="meta-icon-minus indent-collapse-icon" />)
                    : ''}
                <div
                    className="indent-icon"
                    onClick={(e) =>
                        this.handleIndentSelect(e, rowId, includedDocuments)
                    }
                >
                    <i className={this.getIconClassName(huType)} />
                </div>
            </div>
        );
    }

    render() {
        const {
            isSelected, fieldsByName, cols, onMouseDown, onDoubleClick, odd,
            indentSupported, indent, contextType, lastChild, processed,
            includedDocuments, notSaved, caption
        } = this.props;

        return (
            <tr
                onClick={onMouseDown}
                onDoubleClick={onDoubleClick}
                className={
                    (isSelected ? 'row-selected ' : '') +
                    (odd ? 'tr-odd ': 'tr-even ') +
                    (processed ? 'row-disabled ': '') +
                    ((processed && lastChild && !includedDocuments) ?
                        'row-boundary ': ''
                    ) +
                    (notSaved ? 'row-not-saved ': '') +
                    (caption ? 'item-caption ' : '')
                }
            >
                {indentSupported && indent &&
                    <td className="indented">
                        {this.renderTree(contextType)}
                    </td>
                }
                {this.renderCells(cols, fieldsByName)}
            </tr>
        );
    }
}

TableItem.propTypes = {
    dispatch: PropTypes.func.isRequired
};

TableItem = connect(false, false, false, { withRef: true })(TableItem)

export default TableItem
