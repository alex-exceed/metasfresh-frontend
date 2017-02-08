import React, { Component, PropTypes } from 'react';
import {push, replace} from 'react-router-redux';
import {connect} from 'react-redux';

import DatetimeRange from '../widget/DatetimeRange';
import QuickActions from './QuickActions';
import Table from '../table/Table';
import Filters from '../filters/Filters';
import SelectionAttributes from './SelectionAttributes';
import DataLayoutWrapper from '../DataLayoutWrapper';

import SockJs from 'sockjs-client';
import Stomp from 'stompjs/lib/stomp.min.js';

import {
    initLayout
} from '../../actions/GenericActions';

import {
    createViewRequest,
    browseViewRequest,
    addNotification
} from '../../actions/AppActions';

import {
    setPagination,
    setSorting,
    clearListProps,
    clearListPagination,
    initDocumentView,
    setFilter
} from '../../actions/ListActions';

class DocumentList extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: null,
            layout: null,
            clickOutsideLock: false,
            refresh: null
        }
        this.updateData();
    }

    componentWillUnmount() {
        this.sockClient.disconnect();
    }

    componentWillReceiveProps(props) {
        const {sorting, windowType, viewId} = props;

        //if we browse list of docs, changing type of Document
        //does not re-construct component, so we need to
        //make it manually while the windowType changes.
        if(windowType !== this.props.windowType) {
            this.setState(Object.assign({}, this.state, {
                data:null,
                layout:null
            }), () => {
                this.updateData();
            })
        }

        if(viewId !== this.props.viewId){
            this.connectWS(viewId);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !!nextState.layout && !!nextState.data;
    }

    componentDidUpdate(prevProps) {
        const {filters} = this.props;

        const oldFilter = prevProps.filters[0] ? JSON.stringify(prevProps.filters[0]) : '';
        const newFilter = filters[0] ? JSON.stringify(filters[0]) : '';

        if(newFilter !== oldFilter){

            this.updateData(true);
        }
    }

    // We have to postpone this task til the viewId won't be created
    connectWS = (viewId) => {
        this.sock = new SockJs(config.WS_URL);
        this.sockClient = Stomp.Stomp.over(this.sock);

        this.sockClient.debug = null;
        this.sockClient.connect({}, frame => {
            this.sockClient.subscribe('/view/'+ viewId, msg => {
                const {fullyChanged} = JSON.parse(msg.body);
                if(fullyChanged == true){
                    this.browseView();
                    this.setState({
                        refresh: Date.now()
                    })
                }
            });
        });
    }

    setListData = (data) => {
        const {dispatch} = this.props;

        this.setState(Object.assign({}, this.state, {
            data: data
        }), () => {
            this.getView(data.viewId);
            dispatch(initDocumentView(data.viewId));
        })
    }

    createNewView = () => {
        const {dispatch, windowType, type, filters, query} = this.props;
        dispatch(
            createViewRequest(
                windowType, type, 20, filters, query && query.refType,
                query && query.refId
            )
        ).then((response) => {
            this.setListData(response.data);
        })
    }

    browseView = () => {
        const {dispatch, windowType, query, type, filters} = this.props;
        dispatch(browseViewRequest(query.viewId, query.page ? query.page : 1, 20, query.filters, windowType))
            .then((response) => {
                // this.setListData(response.data);
                this.setState(Object.assign({}, this.state, {
                    data: response.data
                }), () => {
                    dispatch(initDocumentView(response.data.viewId));
                })
            }).catch((err) => {
                if(err.response && err.response.status === 404) {
                    this.createNewView(windowType, type, filters);
                }
            });
    }

    updateData = (isNewFilter) => {
        const {
            dispatch, windowType, type, filters, filtersWindowType, query, viewId
        } = this.props;

        if(!!filtersWindowType && (filtersWindowType != windowType)) {
            dispatch(setFilter(null,null));
        }

        windowType && dispatch(
            initLayout(
                'documentView', windowType, null, null, null, null, type, true
            )
        ).then(response => {
            this.setState(Object.assign({}, this.state, {
                layout: response.data
            }), () => {
                if(query && query.viewId && !isNewFilter){
                    this.browseView();
                }else{
                    this.createNewView();
                }
            })
        });
    }

    getView = (viewId) => {
        const {data} = this.state;
        const {dispatch, pagination, sorting, windowType, query, updateUri} = this.props;
        let urlQuery = "";
        let urlPage = pagination.page;

        !!updateUri && updateUri("viewId", viewId);

        if(query){
            if(query.sort){
                urlQuery = query.sort;
                dispatch(setSorting(urlQuery.substring(1), urlQuery[0], windowType));
            }
            if(query.page){
                urlPage = query.page;
                dispatch(setPagination(parseInt(query.page), windowType));
            }
        }
        //
        //  Condition, that ensure wheter windowType
        //  is the same as for saved query params
        //
        else if(windowType === sorting.windowType) {
            urlQuery = this.getSortingQuery(sorting.dir, sorting.prop);
        }else{
            dispatch(clearListProps());
        }

        if(windowType !== pagination.windowType) {
            dispatch(clearListPagination());
        }

        this.getData(data.viewId, urlPage, 20, urlQuery);
    }

    getData = (id, page, pages, sortingQuery) => {
        const {data} = this.state;
        const {dispatch, windowType} = this.props;
        dispatch(browseViewRequest(id, page, pages, sortingQuery, windowType)).then((response) => {
            this.setState(Object.assign({}, this.state, {
                data: response.data
            }))
        });
    }

    getSortingQuery = (asc, field) => {
        let sortingQuery = '';

        if(field && asc) {
            sortingQuery = '+' + field;
        } else if(field && !asc) {
            sortingQuery = '-' + field;
        }
        return sortingQuery;
    }

    sortData = (asc, field, startPage, currPage) => {
        const {sorting, page, dispatch, windowType, updateUri} = this.props;
        const {data} = this.state;

        let setPage = currPage;

        asc && field && !!updateUri && updateUri("sort", (asc?"+":"-")+field);

        dispatch(setSorting(field, asc, windowType));

        if(startPage){
            dispatch(setPagination(1, windowType));
            !!updateUri && updateUri("page", 1);
            setPage = 1;
        }

        this.getData(data.viewId, setPage, 20, this.getSortingQuery(asc, field));
    }

    newDocument = () => {
        const {dispatch, windowType} = this.props;

        dispatch(push('/window/' + windowType + '/new'));
    }

    setClickOutsideLock = (value) => {
        this.setState({
            clickOutsideLock: !!value
        })
    }

    handleChangePage = (index) => {
        const {data} = this.state;
        const {sorting, pagination, dispatch, updateUri, windowType} = this.props;

        let currentPage = pagination.page;

        switch(index){
            case "up":
                currentPage * data.pageLength < data.size ? currentPage++ : null;
                break;
            case "down":
                currentPage != 1 ? currentPage-- : null;
                break;
            default:
                currentPage = index;
        }

        if(currentPage !== pagination.page){
            dispatch(setPagination(currentPage, windowType));
            !!updateUri && updateUri("page", currentPage);

            this.sortData(sorting.dir, sorting.prop, false, currentPage);
        }
    }

    render() {
        const {layout, data, clickOutsideLock, refresh} = this.state;
        const {
            dispatch, windowType, type, filters, pagination, open, closeOverlays,
            selected
        } = this.props;

        if(layout && data) {
            return (
                <div className="document-list-wrapper">
                    <div className="panel panel-primary panel-spaced panel-inline document-list-header">
                        <div>
                            {type === "grid" &&
                                <button
                                    className="btn btn-meta-outline-secondary btn-distance btn-sm hidden-sm-down"
                                    onClick={() => this.newDocument()}
                                >
                                    <i className="meta-icon-add" /> New {layout.caption}
                                </button>
                            }
                            {/*<Filters
                                filterData={layout.filters}
                                filtersActive={data.filters}
                                windowType={windowType}
                                viewId={data.viewId}
                            />*/}
                        </div>
                        <QuickActions
                            windowType={windowType}
                            viewId={data.viewId}
                            selected={selected}
                            refresh={refresh}
                        />
                    </div>
                    <div className="document-list-body">
                        <Table
                            entity="documentView"
                            ref={c => this.table =
                                c && c.getWrappedInstance()
                                && c.getWrappedInstance().refs.instance
                            }
                            rowData={{1: data.result}}
                            cols={layout.elements}
                            tabid={1}
                            type={windowType}
                            emptyText={layout.emptyResultText}
                            emptyHint={layout.emptyResultHint}
                            readonly={true}
                            keyProperty="id"
                            onDoubleClick={(id) => {
                                dispatch(push("/window/" + windowType + "/" + id))
                            }}
                            size={data.size}
                            pageLength={20}
                            handleChangePage={this.handleChangePage}
                            page={pagination.page}
                            mainTable={true}
                            updateDocList={this.updateData}
                            sort={this.sortData}
                            orderBy={data.orderBy}
                            tabIndex={0}
                            open={open}
                            closeOverlays={closeOverlays}
                            indentSupported={layout.supportTree}
                            disableOnClickOutside={clickOutsideLock}
                        >
                            {layout.supportAttributes &&
                                <DataLayoutWrapper
                                    className="table-flex-wrapper attributes-selector"
                                    entity="documentView"
                                    windowType={windowType}
                                    viewId={data.viewId}
                                >
                                    <SelectionAttributes
                                        refresh={refresh}
                                        setClickOutsideLock={this.setClickOutsideLock}
                                        selected={selected}
                                    />
                                </DataLayoutWrapper>
                            }
                        </Table>
                    </div>
                </div>
            );
        }else{
            return false;
        }

    }
}

DocumentList.propTypes = {
    dispatch: PropTypes.func.isRequired,
    sorting: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    filtersWindowType: PropTypes.string,
    viewId: PropTypes.string
}

function mapStateToProps(state) {
    const { listHandler } = state;

    const {
        filters,
        filtersWindowType,
        sorting,
        pagination,
        viewId
    } = listHandler || {
        viewId: "",
        filters: {},
        sorting: {},
        pagination: {},
        filtersWindowType: ""
    }

    return {
        filters,
        sorting,
        pagination,
        filtersWindowType,
        viewId
    }
}

DocumentList = connect(mapStateToProps)(DocumentList)

export default DocumentList;
