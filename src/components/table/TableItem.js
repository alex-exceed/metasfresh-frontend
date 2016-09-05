import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Widget from '../Widget';

import {
    findRowByPropName
} from '../../actions/WindowActions';

class TableItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edited: ""
        };
    }
    handleEditProperty = (e,property) => {
        e.preventDefault();
        this.setState({
            edited: property
        })
    }
    fieldToString = (field) => {
        if(field === null){
            return "";
        }else{
            switch(typeof field){
                case "object":
                    return field[Object.keys(field)[0]];
                    break;
                default:
                    return field;
            }
        }
    }
    renderCells = (cols, cells) => {
        const { type, docId, rowId, tabId } = this.props;
        //iterate over layout settings
        return cols.map((item, index) => {
            const property = item.fields[0].field;
            const widgetData = findRowByPropName(cells, property);

            return (
                <td
                    key={index}
                    tabIndex="0"
                    onDoubleClick={(e) => this.handleEditProperty(e,property)}
                >
                    {
                        this.state.edited === property ?
                            <Widget
                                {...item}
                                dataId={docId}
                                widgetData={widgetData}
                                windowType={type}
                                rowId={rowId}
                                tabId={tabId}
                                noLabel={true}
                            />
                        :
                            this.fieldToString(widgetData.value)
                    }
                </td>
            )
        })
    }
    render() {
        const {isSelected, fields, selectedProducts, onClick, onContextMenu, rowId, cols} = this.props;
        return (
            <tr
                onClick={onClick}
                className={isSelected ? "row-selected" : null}
            >
                {this.renderCells(cols, fields)}
            </tr>
        )
    }
}

TableItem.propTypes = {
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    const { appHandler } = state;
    const {
        selectedProducts
    } = appHandler || {
        selectedProducts: []
    }

    return {
        selectedProducts
    }
}

TableItem = connect(mapStateToProps)(TableItem)

export default TableItem
