import React, { Component, PropTypes } from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';

import Header from '../components/app/Header';
import DatetimeRange from '../components/app/DatetimeRange';
import Table from '../components/table/Table';

import {
    viewLayoutRequest,
    createViewRequest,
    browseViewRequest
} from '../actions/AppActions';

class DocList extends Component {
    constructor(props){
        super(props);

        const {dispatch, windowType} = this.props;

        this.state = {
            page: 1,
            data: {},
            layout: {},
            filters: {}
        };

        dispatch(viewLayoutRequest(windowType, "list")
        ).then((response) =>
            this.setState(Object.assign({}, this.state, {
                layout: response.data,
                filters: response.data.filters
            }))
        ).then(()=>
            dispatch(createViewRequest(windowType, "list", 20, []))
        ).then((response) =>
            this.setState(Object.assign({}, this.state, {
                data: response.data
            }))
        ).then(() => {
            this.getView();
        });
    }

    getView = () => {
        const {data,page} = this.state;
        const {dispatch} = this.props;
        dispatch(browseViewRequest(data.viewId, page, 20)).then((response) => {
            this.setState(Object.assign({}, this.state, {
                data: response.data
            }))
        });
    }

    handleChangePage = (index) => {
        const {data, page} = this.state;
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
            this.setState(Object.assign({}, this.state, {
                page: parseInt(currentPage)
            }), ()=>{
                this.getView();
            });
        }
    }

    render() {
        const {dispatch, windowType} = this.props;
        const {layout, data, page} = this.state;
        if( layout && data) {

            const pages = Math.ceil(data.size / data.pageLength);
            const startPoint = pages - page <= 4 ? pages - 4 : page;
            let pagination = [];
            for(let i = startPoint; i <= startPoint + 4; i++){
                pagination.push(
                    <li className={" page-item " + (page === i ? "active": "")} key={i} onClick={() => this.handleChangePage(i)}>
                        <a className="page-link">{i}</a>
                    </li>
                );
            }

            return (
                <div>
                    <Header />
                    <div className="container header-sticky-distance">
                        <div className="panel panel-primary panel-spaced panel-inline document-list-header">
                            <button
                                className="btn btn-meta-outline-secondary btn-distance btn-sm"
                                onClick={() => dispatch(push('/window/' + windowType + '/new'))}
                            >
                                <i className="meta-icon-add" /> New sales order
                            </button>
                            <span>Filters: </span>
                            <DatetimeRange />
                            <button className="btn btn-meta-outline-secondary btn-distance btn-sm">
                                <i className="meta-icon-preview" /> No search filters
                            </button>

                        </div>
                        <div>
                            <Table
                                rowData={{1: data.result}}
                                cols={layout.elements}
                                tabid={1}
                                type={windowType}
                                emptyText={layout.emptyResultText}
                                emptyHint={layout.emptyResultHint}
                                readonly={true}
                                keyProperty="id"
                                onDoubleClick={(id) => {dispatch(push("/window/"+windowType+"/"+id))}}
                            />
                        </div>
                        <div className="pagination-row">
                            <div>
                                <div>No items selected</div>
                                <div className="pagination-link pointer">Select all on this page</div>
                            </div>

                            <div className="items-row-2 pagination-part">
                                <div>
                                    <div>Sorting by <b>DocNo</b> (1163-1200)</div>
                                    <div>Total items {data.size}</div>
                                </div>
                                <div>
                                    <nav>
                                        <ul className="pagination pointer">
                                            <li className="page-item">
                                                <a className="page-link" onClick={() => this.handleChangePage("down")}>
                                                    <span>&laquo;</span>
                                                </a>
                                            </li>

                                            {pagination}

                                            <li className={"page-item "}>
                                                <a className="page-link" onClick={() => this.handleChangePage("up")}>
                                                    <span>&raquo;</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }else{
            return false;
        }

    }
}

DocList.propTypes = {
    dispatch: PropTypes.func.isRequired
};

DocList = connect()(DocList)

export default DocList;
