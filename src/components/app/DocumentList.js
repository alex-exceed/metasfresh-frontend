import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import counterpart from 'counterpart';

import QuickActions from './QuickActions';
import BlankPage from '../BlankPage';
import Table from '../table/Table';
import Filters from '../filters/Filters';
import FiltersStatic from '../filters/FiltersStatic';
import SelectionAttributes from './SelectionAttributes';
import DataLayoutWrapper from '../DataLayoutWrapper';

import * as _ from 'lodash';

import {
    initLayout,
    getDataByIds
} from '../../actions/GenericActions';

import {
    selectTableItems,
    getItemsByProperty,
    mapIncluded,
    indicatorState,
    connectWS,
    disconnectWS
} from '../../actions/WindowActions';

import {
    setSorting,
    setPagination,
    setListId,
    setListIncludedView
} from '../../actions/ListActions';

import {
    createViewRequest,
    browseViewRequest,
    filterViewRequest,
    deleteStaticFilter
} from '../../actions/AppActions';

class DocumentList extends Component {
    constructor(props){
        super(props);

        const {defaultViewId, defaultPage, defaultSort} = this.props;

        this.pageLength = 20;

        this.state = {
            data: null,
            layout: null,

            viewId: defaultViewId,
            page: defaultPage || 1,
            sort: defaultSort,
            filters: null,

            clickOutsideLock: false,
            refresh: null,

            isShowIncluded: false,
            hasShowIncluded: false
        };

        this.cachedSelection = null;

        this.fetchLayoutAndData();
    }

    componentDidMount = () => {
        this.mounted = true
    }

    componentDidUpdate(prevProps, prevState) {
        const { setModalDescription } = this.props;
        const { data } = this.state;
        if(prevState.data !== data){
            setModalDescription && setModalDescription(data.description);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        disconnectWS.call(this);
    }

    componentWillReceiveProps(props) {
        const {
            windowType, defaultViewId, defaultSort, defaultPage, selected,
            inBackground, dispatch, includedView, selectedWindowType,
            disconnectFromState, refId
        } = props;

        const {
            page, sort, viewId, layout
        } = this.state;

        /*
         * If we browse list of docs, changing type of Document
         * does not re-construct component, so we need to
         * make it manually while the windowType changes.
         * OR
         * We want to refresh the window (generate new viewId)
         * OR
         * The reference ID is changed
         */
        if (
            (windowType !== this.props.windowType) ||
            ((defaultViewId === undefined) && (defaultViewId !== this.props.defaultViewId)) ||
            (refId !== this.props.refId)
        ) {
            this.setState({
                data:null,
                layout:null,
                filters: null,
                viewId: null
            }, () => {
                if (!disconnectFromState) {
                    dispatch(selectTableItems([], null));
                }

                this.fetchLayoutAndData();
            });
        }

        if (
            (defaultSort !== this.props.defaultSort) &&
            (defaultSort !== sort)
        ) {
            this.setState({
                sort: defaultSort
            });
        }

        if (
            (defaultPage !== this.props.defaultPage) &&
            (defaultPage !== page)
        ) {
            this.setState({
                page: defaultPage || 1
            });
        }

        if (
            (defaultViewId !== this.props.defaultViewId) &&
            (defaultViewId !== viewId)
        ) {
            this.setState({
                viewId: defaultViewId
            });
        }

        /*
         * It is case when we need refersh global selection state,
         * because scope is changed
         *
         * After opening modal cache current selection
         * After closing modal with gridview, refresh selected.
         */
        if (
            (inBackground !== this.props.inBackground)
        ) {
            if (!inBackground) {
                // In case of preventing cached selection restore
                if (
                    !disconnectFromState &&
                    this.cachedSelection
                ) {
                    dispatch(
                        selectTableItems(
                            this.cachedSelection,
                            this.props.windowType
                        )
                    );
                }
            }
            else {
                this.cachedSelection = selected;
            }
        }

        if (
            (selectedWindowType === windowType) &&
            (includedView && includedView.windowType && includedView.viewId) &&
            (layout && layout.supportIncludedView) &&
            !_.isEqual(this.props.selected, selected)
        ) {
            dispatch(setListIncludedView());
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !!nextState.layout && !!nextState.data;
    }

    connectWS = (viewId) => {
        const {windowType} = this.props;
        connectWS.call(this, '/view/' + viewId, (msg) => {
            const {fullyChanged, changedIds} = msg;
            if(changedIds){
                getDataByIds(
                    'documentView', windowType, viewId, changedIds.join()
                ).then(response => {
                    response.data.map(row => {
                        this.setState({
                            data: Object.assign(this.state.data, {}, {
                                result: this.state.data.result.map(
                                    resultRow =>
                                        resultRow.id === row.id ?
                                            row : resultRow
                                )
                            })
                        })
                    })
                });
            }

            if(fullyChanged == true){
                this.browseView(true);

                if (this.quickActionsComponent) {
                    this.quickActionsComponent.updateActions();
                }
            }
        });
    }

    doesSelectionExist(selected, hasIncluded) {
        const {data} = this.state;
        // When the rows are changing we should ensure
        // that selection still exist

        if(hasIncluded){
            return true;
        }

        let rows = [];

        data && data.result && data.result.map(item => {
            rows = rows.concat(mapIncluded(item));
        });

        return (data && data.size && data.result && selected && selected[0] &&
            getItemsByProperty(
                rows, 'id', selected[0]
            ).length
        );
    }

    getTableData = (data) => {
        return data;
    }

    redirectToNewDocument = () => {
        const {dispatch, windowType} = this.props;

        dispatch(push('/window/' + windowType + '/new'));
    }

    setClickOutsideLock = (value) => {
        this.setState({
            clickOutsideLock: !!value
        })
    }

    clearStaticFilters = (filterId) => {
        const {dispatch, windowType} = this.props;
        const {viewId} = this.state;

        deleteStaticFilter(windowType, viewId, filterId).then(response => {
            dispatch(push('/window/' + windowType + '?viewId=' + response.data.viewId));
        });
    }

    // FETCHING LAYOUT && DATA -------------------------------------------------

    fetchLayoutAndData = (isNewFilter) => {
        const {
            windowType, type, setModalTitle, setNotFound
        } = this.props;

        const {
            viewId
        } = this.state;

        initLayout(
            'documentView', windowType, null, null, null, null, type, true
        ).then(response => {
            this.mounted && this.setState({
                layout: response.data
            }, () => {
                if(viewId && !isNewFilter){
                    this.browseView();
                }else{
                    if(viewId){
                        this.filterView();
                    } else {
                        this.createView();
                    }
                }
                setModalTitle && setModalTitle(response.data.caption)
            })
        }).catch(() => {
            // We have to always update that fields to refresh that view!
            // Check the shouldComponentUpdate method
            this.setState({
                data: 'notfound',
                layout: 'notfound'
            }, () => {
                setNotFound && setNotFound(true);
            })
        })
    }

    /*
     *  If viewId exist, than browse that view.
     */
    browseView = (refresh) => {
        const {viewId, page, sort} = this.state;

        this.getData(
            viewId, page, sort, refresh
        ).catch((err) => {
            if(err.response && err.response.status === 404) {
                this.createView();
            }
        });
    }

    createView = () => {
        const {
            windowType, type, refType, refId, refTabId, refRowIds
        } = this.props;

        const {page, sort, filters} = this.state;

        createViewRequest(
            windowType, type, this.pageLength, filters, refType, refId, refTabId, refRowIds
        ).then(response => {
            this.mounted && this.setState({
                data: response.data,
                viewId: response.data.viewId
            }, () => {
                this.getData(response.data.viewId, page, sort);
            })
        })
    }

    filterView = () => {
        const {
            windowType
        } = this.props;

        const {page, sort, filters, viewId} = this.state;

        filterViewRequest(
            windowType, viewId, filters
        ).then(response => {
            this.mounted && this.setState({
                data: response.data,
                viewId: response.data.viewId
            }, () => {
                this.getData(response.data.viewId, page, sort);
            })
        })
    }

    getData = (id, page, sortingQuery, refresh) => {
        const {
            dispatch, windowType, updateUri, setNotFound, type, isIncluded
        } = this.props;

        setNotFound && setNotFound(false);
        dispatch(indicatorState('pending'));

        if (updateUri) {
            id && updateUri('viewId', id);
            page && updateUri('page', page);
            sortingQuery && updateUri('sort', sortingQuery);
        }

        return browseViewRequest(
            id, page, this.pageLength, sortingQuery, windowType
        ).then( (response) => {
            let forceSelection = false;

            if (
                ((type === 'includedView') || isIncluded) &&
                response.data && response.data.result &&
                (response.data.result.length > 0)
            ) {
                forceSelection = true;
            }

            this.mounted && this.setState(
                Object.assign({}, {
                    data: response.data,
                    filters: response.data.filters
                }),
                () => {
                    if (
                        forceSelection &&
                        response.data && response.data.result
                    ) {
                        const selection = [
                            response.data.result[0].id
                        ];

                        this.cachedSelection = null;

                        dispatch(
                            selectTableItems(selection, windowType)
                        );
                    }

                    this.connectWS(response.data.viewId);
                }
            );

            dispatch(indicatorState('saved'));
        });
    }

    // END OF FETCHING LAYOUT && DATA ------------------------------------------

    // MANAGING SORT, PAGINATION, FILTERS --------------------------------------

    handleChangePage = (index) => {
        const {data, sort, page, viewId} = this.state;

        let currentPage = page;

        switch(index){
            case 'up':
                currentPage * data.pageLength < data.size ?
                    currentPage++ : null;
                break;
            case 'down':
                currentPage != 1 ? currentPage-- : null;
                break;
            default:
                currentPage = index;
        }

        this.setState({
            page: currentPage
        }, () => {
            this.getData(viewId, currentPage, sort);
        });
    }

    getSortingQuery = (asc, field) => (asc ? '+' : '-') + field;

    sortData = (asc, field, startPage) => {
        const {viewId, page} = this.state;

        this.setState({
            sort: this.getSortingQuery(asc, field)
        }, () => {
            this.getData(
                viewId, startPage ? 1 : page, this.getSortingQuery(asc, field)
            );
        });
    }

    handleFilterChange = (filters) => {
        this.setState({
            filters: filters,
            page: 1
        }, () => {
            this.fetchLayoutAndData(true);
        })
    }

    // END OF MANAGING SORT, PAGINATION, FILTERS -------------------------------

    redirectToDocument = (id) => {
        const {
            dispatch, isModal, windowType, isSideListShow
        } = this.props;
        const {page, viewId, sort} = this.state;

        if (isModal) {
            return;
        }

        dispatch(push('/window/' + windowType + '/' + id));

        if (!isSideListShow) {
            // Caching last settings
            dispatch(setPagination(page, windowType));
            dispatch(setSorting(sort, windowType));
            dispatch(setListId(viewId, windowType));
        }
    }

    showIncludedViewOnSelect = (showIncludedView, data) => {
        const {
            dispatch
        } = this.props;

        this.setState({
            isShowIncluded: showIncludedView ? true : false,
            hasShowIncluded: showIncludedView ? true : false
        }, ()=> {
            if (showIncludedView) {
                dispatch(setListIncludedView(data.windowId, data.viewId));
            }
        });
    }

    render() {
        const {
            layout, data, viewId, clickOutsideLock, refresh, page, filters,
            isShowIncluded, hasShowIncluded, refreshSelection
        } = this.state;

        const {
            windowType, open, closeOverlays, selected, inBackground,
            fetchQuickActionsOnInit, isModal, processStatus, readonly,
            includedView, isIncluded, disablePaginationShortcuts,
            notfound, disconnectFromState, autofocus, selectedWindowType,
            inModal
        } = this.props;

        const hasIncluded = layout && layout.supportIncludedView &&
            includedView && includedView.windowType && includedView.viewId;
        const selectionValid = this.doesSelectionExist(selected, hasIncluded);

        if(notfound || layout === 'notfound' || data === 'notfound'){
            return (
                <BlankPage
                    what={counterpart.translate('view.error.windowName')}
                />
            );
        }

        let showQuickActions = true;
        if (isModal && !inBackground && !selectionValid) {
            showQuickActions = false;
        }

        if (layout && data) {
            return (
                <div
                    className={
                        'document-list-wrapper ' +
                        ((isShowIncluded || isIncluded) ?
                            'document-list-included ' : '') +
                        ((hasShowIncluded || hasIncluded) ?
                            'document-list-has-included ' : '')
                    }
                >
                        {!readonly && <div
                            className="panel panel-primary panel-spaced panel-inline document-list-header"
                        >
                            <div className={hasIncluded ? 'disabled' : ''}>
                                {layout.supportNewRecord && !isModal && (
                                    <button
                                        className="btn btn-meta-outline-secondary btn-distance btn-sm hidden-sm-down btn-new-document"
                                        onClick={() =>
                                            this.redirectToNewDocument()}
                                        title={layout.newRecordCaption}
                                    >
                                        <i className="meta-icon-add" />
                                        {layout.newRecordCaption}
                                    </button>
                                )}

                                {layout.filters && (
                                    <Filters
                                        {...{windowType, viewId}}
                                        filterData={layout.filters}
                                        filtersActive={filters}
                                        updateDocList={this.handleFilterChange}
                                    />
                                )}

                                {data.staticFilters && (
                                    <FiltersStatic
                                        {...{windowType, viewId}}
                                        data={data.staticFilters}
                                        clearFilters={this.clearStaticFilters}
                                    />
                                )}
                            </div>

                            {showQuickActions && (
                                <QuickActions
                                    {...{
                                        selectedWindowType,
                                        refresh,
                                        processStatus
                                    }}
                                    ref={ (c) => {
                                        this.quickActionsComponent = (
                                            c && c.getWrappedInstance()
                                        );
                                    }}
                                    selected={selected}
                                    viewId={viewId}
                                    windowType={windowType}
                                    fetchOnInit={fetchQuickActionsOnInit}
                                    disabled={hasIncluded}
                                    shouldNotUpdate={
                                        inBackground && !hasIncluded
                                    }
                                    inBackground={disablePaginationShortcuts}
                                    inModal={inModal}
                                />
                            )}
                        </div>}
                        <div className="document-list-body">
                            <Table
                                entity="documentView"
                                ref={c => this.table =
                                    c && c.getWrappedInstance()
                                    && c.getWrappedInstance().refs.instance
                                }
                                rowData={{1: data.result}}
                                cols={layout.elements}
                                collapsible={layout.collapsible}
                                expandedDepth={layout.expandedDepth}
                                tabid={1}
                                type={windowType}
                                emptyText={layout.emptyResultText}
                                emptyHint={layout.emptyResultHint}
                                readonly={true}
                                keyProperty="id"
                                onDoubleClick={(id) =>
                                        !isIncluded &&
                                            this.redirectToDocument(id)}
                                size={data.size}
                                pageLength={this.pageLength}
                                handleChangePage={this.handleChangePage}
                                mainTable={true}
                                updateDocList={this.fetchLayoutAndData}
                                sort={this.sortData}
                                orderBy={data.orderBy}
                                tabIndex={0}
                                indentSupported={layout.supportTree}
                                disableOnClickOutside={clickOutsideLock}
                                defaultSelected={this.cachedSelection ?
                                    this.cachedSelection : selected}
                                refreshSelection={refreshSelection}
                                queryLimitHit={data.queryLimitHit}
                                doesSelectionExist={this.doesSelectionExist}
                                showIncludedViewOnSelect={
                                    this.showIncludedViewOnSelect
                                }
                                supportIncludedViewOnSelect={
                                    layout.supportIncludedViewOnSelect
                                }
                                {...{isIncluded, disconnectFromState, autofocus,
                                    open, page, closeOverlays, inBackground,
                                    disablePaginationShortcuts, isModal,
                                    hasIncluded, viewId
                                }}
                            >
                                {layout.supportAttributes && !isIncluded &&
                                    !hasIncluded &&
                                    <DataLayoutWrapper
                                        className="table-flex-wrapper attributes-selector js-not-unselect"
                                        entity="documentView"
                                        {...{windowType, viewId}}
                                    >
                                        <SelectionAttributes
                                            {...{refresh}}
                                            setClickOutsideLock={
                                                this.setClickOutsideLock
                                            }
                                            selected={selectionValid ?
                                                selected : undefined
                                            }
                                            shouldNotUpdate={
                                                inBackground
                                            }
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
    windowType: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
}

DocumentList = connect()(DocumentList);

export default DocumentList;
