import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import counterpart from 'counterpart';

import {updateBreadcrumb, elementPathRequest} from '../../actions/MenuActions';

import Actions from './Actions';

import BookmarkButton from './BookmarkButton';

import keymap from '../../keymap.js';

class Subheader extends Component {
    constructor(props){
        super(props);

        this.state = {
            pdfSrc: null,
            elementPath: ''
        }
    }

    componentDidMount() {
        document.getElementsByClassName('js-subheader-column')[0].focus();

        const entity = (this.props.entity === 'board') ? 'board' : 'window';

        elementPathRequest(entity, this.props.windowType).then(response => {
            this.setState({
                elementPath: response.data
            });
        });
    }

    handleKeyDown = (e) => {
        const {closeSubheader} = this.props;

        switch(e.key){
            case 'ArrowDown': {
                e.preventDefault();
                const activeElem = this.getItemActiveElem();
                if(activeElem.nextSibling) {
                    activeElem.nextSibling.focus();
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const activeEl = this.getItemActiveElem();
                if(activeEl.previousSibling) {
                    activeEl.previousSibling.focus();
                }
                break;
            }
            case 'ArrowLeft': {
                e.preventDefault();
                const activeColumn = this.getColumnActiveElem();
                if(activeColumn.previousSibling) {
                    activeColumn.previousSibling.focus();
                    if(this.getItemActiveElem().nextSibling) {
                         this.getItemActiveElem().nextSibling.focus();
                    }
                }
                break;
            }
            case 'ArrowRight': {
                e.preventDefault();
                const activeCol = this.getColumnActiveElem();
                if(activeCol.nextSibling) {
                    activeCol.nextSibling.focus();
                    if(this.getItemActiveElem().nextSibling){
                        this.getItemActiveElem().nextSibling.focus();
                    }
                }
                break;
            }
            case 'Enter':
                e.preventDefault();
                document.activeElement.click();
                break;
            case 'Escape':
                e.preventDefault();
                closeSubheader();
                break;
        }
    }

    handleClickOutside = () => {
        const { closeSubheader } = this.props;
        closeSubheader();
    }

    toggleAttachmentDelete = (value) => {
        this.setState({
            attachmentHovered: value
        })
    }

    getColumnActiveElem = () => {
        const active = document.activeElement;
        if(active.classList.contains('js-subheader-item')) {
            return active.parentNode;
        } else {
             return active;
        }
    }

    getItemActiveElem = () => {
        const active = document.activeElement;
        if(
            active.classList.contains('js-subheader-column')
        ) {
            return active.childNodes[1];
        } else {
            return active;
        }
    }

    handleUpdateBreadcrumb = (nodes) => {
        const {dispatch} = this.props;
        nodes.map(node => dispatch(updateBreadcrumb(node)));
    }

    handleDownloadSelected = event => {
        if (this.props.selected.length === 0) {
            event.preventDefault();
        }
    }

    renderDocLink = function (docLinks, {
        action,
        handler,
        icon,
        caption,
        hotkey
    }) {
        const { closeSubheader, standardActions } = this.props;

        if (standardActions.has(action)) {
            docLinks.push(
                <div
                    key={action}
                    className="subheader-item js-subheader-item"
                    tabIndex={0}
                    onClick={() => {
                        handler()
                        closeSubheader();
                    }}
                >
                    <i className={icon} />
                    {caption}
                    <span className="tooltip-inline">
                        {hotkey}
                    </span>
                </div>
            )
        }
    }

    renderDocLinks = () => {
        const {
            dataId,
            docNo,
            handleClone,
            handleDelete,
            handleEmail,
            handleLetter,
            handlePrint,
            openModal,
            windowType
        } = this.props;

        if (!dataId) {
            return false;
        }

        const docLinks = [];

        const renderDocLink = this.renderDocLink.bind(this, docLinks);

        renderDocLink({
            action: 'advancedEdit',
            handler: () => {
                openModal(windowType, 'window', 'Advanced edit', true);
            },
            icon: 'meta-icon-edit',
            caption: counterpart.translate('window.advancedEdit.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.OPEN_ADVANCED_EDIT
        });

        renderDocLink({
            action: 'clone',
            handler: () => {
                handleClone(windowType, dataId);
            },
            icon: 'meta-icon-duplicate',
            caption: counterpart.translate('window.clone.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.CLONE_DOCUMENT
        });

        renderDocLink({
            action: 'email',
            handler: () => {
                handleEmail();
            },
            icon: 'meta-icon-mail',
            caption: counterpart.translate('window.email.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.OPEN_EMAIL
        });

        renderDocLink({
            action: 'letter',
            handler: () => {
                handleLetter();
            },
            icon: 'meta-icon-letter',
            caption: counterpart.translate('window.letter.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.OPEN_LETTER
        });

        renderDocLink({
            action: 'print',
            handler: () => {
                handlePrint(windowType, dataId, docNo);
            },
            icon: 'meta-icon-print',
            caption: counterpart.translate('window.Print.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.OPEN_PRINT_RAPORT
        });

        renderDocLink({
            action: 'delete',
            handler: () => {
                handleDelete();
            },
            icon: 'meta-icon-delete',
            caption: counterpart.translate('window.Delete.caption'),
            hotkey: keymap.GLOBAL_CONTEXT.DELETE_DOCUMENT
        });

        return docLinks;
    }

    renderNavColumn = () => {
        const {
            closeSubheader,
            editmode,
            handleEditModeToggle,
            query,
            redirect,
            selected,
            siteName,
            windowType
        } = this.props;

        const {
            elementPath
        } = this.state;

        let currentNode = elementPath;
        if (currentNode && currentNode.children) {
            do {
                currentNode = currentNode.children[currentNode.children.length - 1];
            } while (currentNode && currentNode.children && (currentNode.type !== 'window'));
        }

        return (
            <div
                className="subheader-column js-subheader-column"
                tabIndex={0}
            >
                <div
                    className="subheader-header"
                >
                    <BookmarkButton
                        isBookmark={currentNode && currentNode.favorite}
                        nodeId={currentNode && currentNode.nodeId}
                        transparentBookmarks={!!siteName}
                        updateData={this.handleUpdateBreadcrumb}
                    >
                        <span
                            title={
                                currentNode ? currentNode.caption : siteName
                            }
                            className="subheader-title">
                                {currentNode ? currentNode.caption : siteName}
                        </span>
                    </BookmarkButton>
                </div>
                <div className="subheader-break" />
                {windowType && <div
                    className="subheader-item js-subheader-item"
                    tabIndex={0}
                    onClick={() => { redirect(
                        '/window/'+ windowType + '/new'
                    ); closeSubheader()}
                }>
                    <i className="meta-icon-report-1" />
                    {counterpart.translate('window.new.caption')}
                    <span className="tooltip-inline">
                        {keymap.GLOBAL_CONTEXT.NEW_DOCUMENT}
                    </span>
                </div>}
                {windowType && query && query.viewId && (
                    <a
                        className="subheader-item js-subheader-item"
                        href={`${config.API_URL}/documentView/${windowType}/${query.viewId}/export/excel?selectedIds=${selected.join(',')}`}
                        download
                        onClick={this.handleDownloadSelected}
                        style={{
                            opacity: selected.length === 0 ? '0.5' : 1
                        }}
                    >
                        {counterpart.translate('window.downloadSelected.caption')}{selected.length === 0 && ` (${counterpart.translate('window.downloadSelected.nothingSelected')})`}
                    </a>
                )}
                {this.renderDocLinks()}
                {editmode !== undefined && <div
                    key={editmode}
                    className="subheader-item js-subheader-item"
                    tabIndex={0}
                    onClick={() => {handleEditModeToggle(); closeSubheader()}}
                >
                    <i className="meta-icon-settings" />
                    {editmode ?
                        counterpart.translate('window.closeEditMode') :
                        counterpart.translate('window.openEditMode')
                    }
                    <span className="tooltip-inline">
                        {keymap.GLOBAL_CONTEXT.TOGGLE_EDIT_MODE}
                    </span>
                </div>}
            </div>
        )
    }

    renderActionsColumn = () => {
        const {
            windowType, dataId, selected, selectedWindowType, entity, query,
            openModal, openModalRow, closeSubheader, notfound, activeTab
        } = this.props;

        return (
            <Actions
                key={1}
                {...{
                    windowType, entity, openModal, openModalRow, closeSubheader, notfound
                }}
                docId={dataId ? dataId : query && query.viewId}
                rowId={selectedWindowType === windowType ? selected : []}
                activeTab={activeTab}
                activeTabSelected={(activeTab && selected && (selected.length === 1)) ? selected: []}
            />
        );

    }

    render() {

        return (
            <div
                className="subheader-container overlay-shadow subheader-open js-not-unselect"
                tabIndex={0}
                onKeyDown={this.handleKeyDown}
                ref={(c)=> this.subHeader = c}
            >
                <div className="container-fluid-subheader container-fluid">
                    <div className="subheader-row">
                        {this.renderNavColumn()}
                        {this.renderActionsColumn()}
                    </div>
                </div>
            </div>
        )
    }
}

Subheader.propTypes = {
    dispatch: PropTypes.func.isRequired
};

Subheader = connect(state => ({
    standardActions: state.windowHandler.master.standardActions
}))(onClickOutside(Subheader));

export default Subheader;
