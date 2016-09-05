import React, { Component } from 'react';

import {
    openModal
} from '../../actions/WindowActions';

class TableContextMenu extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        // this.contextMenu.addEventListener("blur", ()=>{
        //     this.contextMenu.classList.remove('context-menu-open');
        // });

        // this.contextMenu.focus();

    }

    handleAdvancedEdit = () => {
        const {dispatch, tabid} = this.props;
        dispatch(openModal(windowType + "&tabid=" + tabid + "&advanced=true"));
    }
    render() {
        const {isDisplayed, x, y, blur} = this.props;
        return (
            !!isDisplayed && <div
                className="context-menu context-menu-open panel-bordered panel-primary"
                //ref={(c) => this.contextMenu = c}
                ref={function(menu) {
                      if (menu != null) {
                        menu.focus();
                      }
                    }}
                tabIndex="0" style={{left: this.props.x, top: this.props.y, display: (this.props.isDisplayed ? "block" : "none") }}
                onBlur={this.props.blur}
            >
                <div className="context-menu-item">
                    <i className="meta-icon-edit" /> Advanced edit
                </div>
            </div>
        )

    }


}

export default TableContextMenu
