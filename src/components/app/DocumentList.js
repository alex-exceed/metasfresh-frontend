import React, { Component, PropTypes } from 'react';
import {push, replace} from 'react-router-redux';
import {connect} from 'react-redux';

import DatetimeRange from './DatetimeRange';
import Table from '../table/Table';
import Filters from './Filters';

import {
    viewLayoutRequest,
    createViewRequest,
    browseViewRequest
} from '../../actions/AppActions';

import {
    setPagination,
    setSorting,
    clearListProps
} from '../../actions/ListActions';

class DocumentList extends Component {
    constructor(props){
        super(props);
        const {filters, type, windowType} = props;
        console.log(props);

        this.state = {
            data: null,
            layout: null
        }


        this.updateData(type, windowType);
    }

    componentWillReceiveProps(props) {
        const {sorting, type, windowType} = props;

        //if we browse list of docs, changing type of Document
        //does not re-construct component, so we need to
        //make it manually while the windowType changes.
        if(windowType !== this.props.windowType) {
            this.updateData(type, windowType);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {

        return !!nextState.layout && !!nextState.data;
    }

    updateData = (type, windowType) => {

        const {dispatch} = this.props;

        console.log('updated');
        
        windowType && dispatch(viewLayoutRequest(windowType, type)).then(response => {
            console.log('LAYOUT');
            console.log(response.data);
            const  { filters } = this.props
            console.log('filters');
            console.log(filters);
            this.setState(Object.assign({}, this.state, {
                layout: response.data
            }), () => {
               
                dispatch(createViewRequest(windowType, type, 20, !!filters ? [filters] : [])).then((response) => {
                    console.log('VIEW');
                    console.log(response.data);
                    this.setState(Object.assign({}, this.state, {
                        data: response.data
                    }), () => {
                        this.getView();
                    })
                })
            })
        });


    }

    getView = () => {
        const {data} = this.state;
        const {dispatch, page, sorting, windowType, query} = this.props;
        let urlQuery = "";
     

        if(query && (query.sortby && query.sortdir)){
            urlQuery = this.getSortingQuery(query.sortdir, query.sortby);
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


        this.getData(data.viewId, page, 20, urlQuery);
    }

    getData = (id, page, pages, sortingQuery) => {
        const {data} = this.state;
        const {dispatch} = this.props;

        dispatch(browseViewRequest(id, page, pages, sortingQuery)).then((response) => {
            console.log('DATA ');
            console.log(response.data);
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

    sortData = (asc, field, startPage) => {
        const {sorting, page, dispatch, windowType, sortingCallback} = this.props;
        const {data} = this.state;

        sortingCallback && sortingCallback(asc, field);

        dispatch(setSorting(field, asc, windowType));

        if(startPage){
            dispatch(setPagination(1, windowType));
        }

        this.getData(data.viewId, page, 20, this.getSortingQuery(asc, field));
    }

    handleChangePage = (index) => {
        const {data} = this.state;
        const {sorting, page, dispatch} = this.props;

        let currentPage = page;

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

        if(currentPage !== page){
            dispatch(setPagination(parseInt(currentPage)));
            this.sortData(sorting.dir, sorting.prop);
        }
    }

    render() {
        const {layout, data} = this.state;
        const {dispatch, windowType, type, filters, page} = this.props;

        if(layout && data) {
            return (
                <div>
                    <div className="panel panel-primary panel-spaced panel-inline document-list-header">
                        {type === "grid" &&
                            <button
                                className="btn btn-meta-outline-secondary btn-distance btn-sm"
                                onClick={() => dispatch(push('/window/' + windowType + '/new'))}
                            >
                                <i className="meta-icon-add" /> New {layout.caption}
                            </button>
                        }
                        {type === "grid" &&
                            <span>Filters: </span>
                        }
                        <DatetimeRange />
                        <button className="btn btn-meta-outline-secondary btn-distance btn-sm">
                            <i className="meta-icon-preview" />
                            {filters ?
                                " ..." : " No search filters"
                            }
                        </button>
                    </div>

                    <Filters filterData={layout.filters} windowType={windowType} updateDocList={this.updateData} />


                    <div>
                        <Table
                            ref={c => this.table = c && c.getWrappedInstance().refs.instance}
                            rowData={{1: data.result}}
                            cols={layout.elements}
                            tabid={1}
                            type={windowType}
                            emptyText={layout.emptyResultText}
                            emptyHint={layout.emptyResultHint}
                            readonly={true}
                            keyProperty="id"
                            onDoubleClick={(id) => {dispatch(push("/window/"+windowType+"/"+id))}}
                            size={data.size}
                            pageLength={20}
                            handleChangePage={this.handleChangePage}
                            page={page}
                            mainTable={true}
                            updateDocList={this.updateData}
                            sort={this.sortData}
                            orderBy={data.orderBy}
                        />
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
    page: PropTypes.number.isRequired,
    sorting: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    const { listHandler } = state;

    const {
        filters,
        page,
        sorting
    } = listHandler || {
        filters: null,
        page: 1,
        sorting: {}
    }

    return {
        filters,
        page,
        sorting
    }
}

DocumentList = connect(mapStateToProps)(DocumentList)

export default DocumentList;
