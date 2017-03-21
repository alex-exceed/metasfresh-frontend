import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import {
    findRowByPropName,
    attachFileAction
} from '../actions/WindowActions';

import {
    addNotification
} from '../actions/AppActions';

import Window from '../components/Window';
import Modal from '../components/app/Modal';
import RawModal from '../components/app/RawModal';
import DocumentList from '../components/app/DocumentList';
import Container from '../components/Container';

class MasterWindow extends Component {
    constructor(props){
        super(props);

        this.state = {
            newRow: false,
            modalTitle: null
        }
    }

    componentDidMount(){
        const {master} = this.props;
        const isDocumentNotSaved = !master.saveStatus.saved;

        if(isDocumentNotSaved){
            window.addEventListener('beforeunload', this.confirm);
        }
    }

    componentDidUpdate(prevProps) {
        const {master} = this.props;
        const isDocumentNotSaved = !master.saveStatus.saved;
        const isDocumentSaved = master.saveStatus.saved;

        if(prevProps.master.saveStatus.saved && isDocumentNotSaved) {
            window.addEventListener('beforeunload', this.confirm)
        }
        if (!prevProps.master.saveStatus.saved && isDocumentSaved) {
            window.removeEventListener('beforeunload', this.confirm)
        }
    }

    componentWillUnmount() {
        const { master } = this.props;
        const isDocumentNotSaved = !master.saveStatus.saved;

        if(isDocumentNotSaved){
            const result = window.confirm('Do you really want to leave?');

            if(!result){
                window.removeEventListener('beforeunload', this.confirm)
                this.context.router.goBack();
            }
        }
    }

    confirm = (e) => {
        e.returnValue = '';
    }

    closeModalCallback = (isNew) => {
        if(isNew){
            this.setState({
                    newRow: true
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            newRow: false
                        })
                    }, 1000);
                }
            )
        }
    }

    handleDropFile(files){
        const file = files instanceof Array ? files[0] : files;

        if (!(file instanceof File)){
            return Promise.reject();
        }

        const { dispatch, master } = this.props;
        const dataId = findRowByPropName(master.data, 'ID').value;
        const { type } = master.layout;

        let fd = new FormData();
        fd.append('file', file);

        return dispatch(attachFileAction(type, dataId, fd));
    }

    handleRejectDropped(droppedFiles){
        const { dispatch } = this.props;

        const dropped = droppedFiles instanceof Array ? droppedFiles[0] : droppedFiles;

        dispatch(addNotification(
            'Attachment', 'Dropped item [' +
            dropped.type +
            '] could not be attached', 5000, 'error'
        ))
    }

    setModalTitle = (title) => {
        this.setState({
            modalTitle: title
        })
    }

    render() {
        const {
            master, modal, breadcrumb, references, actions, attachments,
            rawModal, selected, indicator, params
        } = this.props;

        const {newRow, modalTitle} = this.state;

        const {
            documentNoElement, docActionElement, documentSummaryElement, type
        } = master.layout;

        const dataId = master.docId;

        const docNoData = findRowByPropName(
            master.data, documentNoElement && documentNoElement.fields[0].field
        );

        const docStatusData = {
            'status': findRowByPropName(master.data, 'DocStatus'),
            'action': findRowByPropName(master.data, 'DocAction'),
            'displayed': true
        };

        const docSummaryData = findRowByPropName(
            master.data,
            documentSummaryElement && documentSummaryElement.fields[0].field
        );

        return (
            <Container
                entity="window"
                docActionElem = {docActionElement}
                docStatusData = {docStatusData}
                docNoElement = {documentNoElement}
                docNoData = {docNoData}
                docSummaryData = {docSummaryData}
                dataId={dataId}
                windowType={params.windowType}
                breadcrumb={breadcrumb}
                references={references}
                actions={actions}
                attachments={attachments}
                showSidelist={true}
                showIndicator={!modal.visible}
                isDocumentNotSaved={
                    !master.saveStatus.saved &&
                    !master.validStatus.initialValue
                }
            >
                {modal.visible &&
                    <Modal
                        relativeType={type}
                        relativeDataId={dataId}
                        triggerField={modal.triggerField}
                        windowType={modal.type}
                        dataId={modal.dataId ? modal.dataId : dataId}
                        data={modal.data}
                        layout={modal.layout}
                        rowData={modal.rowData}
                        tabId={modal.tabId}
                        rowId={modal.rowId}
                        modalTitle={modal.title}
                        modalType={modal.modalType}
                        modalViewId={modal.viewId}
                        isAdvanced={modal.isAdvanced}
                        viewId={null}
                        modalViewDocumentIds={modal.viewDocumentIds}
                        closeCallback={this.closeModalCallback}
                        rawModalVisible={rawModal.visible}
                        indicator={indicator}
                        modalSaveStatus={modal.saveStatus ? modal.saveStatus.saved : true}
                        isDocumentNotSaved={modal.saveStatus ?
                            !modal.saveStatus.saved &&
                            !modal.validStatus.initialValue : false
                        }
                     />
                 }
                 {rawModal.visible &&
                     <RawModal
                         modalTitle={modalTitle}
                     >
                         <DocumentList
                             type="grid"
                             windowType={parseInt(rawModal.type)}
                             defaultViewId={rawModal.viewId}
                             selected={selected}
                             setModalTitle={this.setModalTitle}
                         />
                     </RawModal>
                 }
                <Window
                    data={master.data}
                    layout={master.layout}
                    rowData={master.rowData}
                    dataId={dataId}
                    isModal={false}
                    newRow={newRow}
                    handleDropFile={accepted => this.handleDropFile(accepted)}
                    handleRejectDropped={rejected => this.handleRejectDropped(rejected)}
                />
            </Container>
        );
    }
}

MasterWindow.propTypes = {
    modal: PropTypes.object.isRequired,
    master: PropTypes.object.isRequired,
    breadcrumb: PropTypes.array.isRequired,
    references: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
    attachments: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    selected: PropTypes.array,
    rawModal: PropTypes.object.isRequired,
    indicator: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    const { windowHandler, menuHandler } = state;
    const {
        master,
        modal,
        rawModal,
        selected,
        indicator
    } = windowHandler || {
        master: {},
        modal: false,
        rawModal: {},
        selected: [],
        indicator: ''
    }

    const {
        breadcrumb,
        references,
        actions,
        attachments
    } = menuHandler || {
        references: [],
        breadcrumb: [],
        actions: [],
        attachments: []
    }

    return {
        master,
        breadcrumb,
        references,
        modal,
        actions,
        attachments,
        selected,
        rawModal,
        indicator
    }
}

MasterWindow.contextTypes = {
    router: React.PropTypes.object.isRequired
}

MasterWindow = connect(mapStateToProps)(MasterWindow)

export default MasterWindow;
