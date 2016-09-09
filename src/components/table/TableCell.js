import React, { Component } from 'react';
import Widget from '../Widget';
import onClickOutside from 'react-onclickoutside';

import {fieldToString} from '../../actions/WindowActions';
class TableCell extends Component {
    constructor(props) {
        super(props);
    }
    handleClickOutside = (e) => {
        const {onClickOutside} = this.props;

        //it is important to change focus before collapsing to
        //blur Widget field and patch data
        this.cell && this.cell.focus();

        onClickOutside(e);
    }
    render() {
        const {isEdited, widgetData, item, docId, type, rowId, tabId, onDoubleClick} = this.props;
        return (
            <td
                tabIndex="0"
                ref={(c) => this.cell = c}
                onDoubleClick={onDoubleClick}
                className={
                    (item.gridAlign ? "text-xs-" + item.gridAlign + " " : "")
                }
            >
                {
                    isEdited ?
                        <Widget
                            {...item}
                            dataId={docId}
                            widgetData={[widgetData]}
                            windowType={type}
                            rowId={rowId}
                            tabId={tabId}
                            noLabel={true}
                            gridAlign={item.gridAlign}
                        />
                    :
                        fieldToString(widgetData.value)
                }
            </td>
        )
    }
}

export default onClickOutside(TableCell)
