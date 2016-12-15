import React, { Component,PropTypes } from 'react';
import { connect } from 'react-redux';
import update from 'react-addons-update';

import {
    openModal,
    deleteData,
    deleteLocal
} from '../../actions/WindowActions';

import Prompt from '../app/Prompt';

class TableContextMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prompt: {
                open: false,
                title: "Delete",
                text: "Are you sure?",
                buttons: {
                    submit: "Delete",
                    cancel: "Cancel"
                }
            }
        }
    }

    handleAdvancedEdit = () => {
        const {dispatch, tabId, type, selected} = this.props;

        dispatch(openModal("Advanced edit", type + "&advanced=true", "window", tabId, selected[0]));
    }

    handleDelete = () => {
        this.setState(update(this.state, {
            prompt: {
                open: {$set: true}
            }
        }));
    }

    handleOpenNewTab = () => {
        const {type, selected} = this.props;
        window.open("/window/" + type + "/" + selected[0], "_blank");
    }

    handlePromptCancelClick = () => {
        this.setState(update(this.state, {
            prompt: {
                open: {$set: false}
            }
        }))

        this.props.blur();
    }


    handlePromptSubmitClick = () => {
        const {dispatch,  tabId, type, docId, selected, deselect, mainTable, updateDocList} = this.props;
        this.setState(update(this.state, {
            prompt: {
                open: {$set: false}
            }
        }))

        if(mainTable){
            if(selected.length>1){
                for(let i=0;i<selected.length;i++){
                    dispatch(deleteData(type, selected[i]));
                }
                updateDocList();
                deselect();
            } else {
                dispatch(deleteData(type, selected))
                .then(response => {
                    updateDocList();
                }).then(response => {
                    deselect();
                });
            }

        } else {
            dispatch(deleteData(type, docId, tabId, selected))
            .then(response => {
                dispatch(deleteLocal(tabId, selected, "master"))
            }).then(response => {
                deselect();
            });
        }

        this.props.blur();

    }

    computePositionOfContextMenu = (x, y, width, height) => {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let position = {};

        if (windowWidth - x > width) {
            position.x = x;
        } else {
            position.x = windowWidth - width;
        }

        if (windowHeight - y > height) {
            position.y = y
        } else {
            position.y = windowHeight - height;
        }

        return position;
    }

    getXposition = (x,width) => {
        let windowWidth = window.innerWidth;
        let position = null;

        if (windowWidth - x > width) {
            position = x;
        } else {
            position = windowWidth - width;
        }

        return position;
    }

    getYposition = (y,height) => {
        let windowHeight = window.innerHeight;
        let position = null;

        if (windowHeight - y > height) {
            position = y
        } else {
            position = windowHeight - height;
        }

        return position;
    }


    render() {
        const {isDisplayed, x, y, blur, selected, dispatch, mainTable} = this.props;

        let width = 150;
        let height = 104;

        let position = this.computePositionOfContextMenu(x, y, width, height);

        const style = {
            left: position.x,
            top: position.y,
            display: (isDisplayed ? "block" : "none")
        }
        const {prompt} = this.state;

        const isSelectedOne = selected.length === 1;
        return (
           !!isDisplayed &&
                <div
                    className="context-menu context-menu-open panel-bordered panel-primary"
                    ref={(c) => {this.contextMenu = c; c && c.focus()}}
                    style={{left: this.getXposition(x, this.contextMenu.offsetWidth), top: this.getYposition(y, this.contextMenu.offsetHeight)} }
                    tabIndex="0"
                    onBlur={blur}
                >
                {isSelectedOne && !mainTable &&
                    <div className="context-menu-item" onClick={this.handleAdvancedEdit}>
                        <i className="meta-icon-edit" /> Advanced edit
                    </div>
                }

                <div className="context-menu-item" onClick={this.handleOpenNewTab}>
                    <i className="meta-icon-file" /> Open in new tab
                </div>
                <div className="context-menu-item" onClick={this.handleDelete}>
                    <i className="meta-icon-edit" /> Delete
                </div>
                <Prompt
                    isOpen={prompt.open}
                    title={prompt.title}
                    text={prompt.text}
                    buttons={prompt.buttons}
                    onCancelClick={this.handlePromptCancelClick}
                    onSubmitClick={this.handlePromptSubmitClick}
                />
            </div>
        )

    }
}


TableContextMenu.propTypes = {
    dispatch: PropTypes.func.isRequired
};

TableContextMenu = connect()(TableContextMenu)

export default TableContextMenu
