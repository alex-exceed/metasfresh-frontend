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

import {
    getWindowBreadcrumb
} from '../actions/MenuActions';

class DocList extends Component {
    constructor(props){
        super(props);

        this.state = {
            page: 1,
            data: {},
            layout: {},
            filters: {},
            sortingAsc: false,
            test: 'aaa',
            sortingField: ''
        }
    }

    componentDidMount = () => {
        const {dispatch, windowType} = this.props;

        dispatch(getWindowBreadcrumb(windowType))
    }

    componentWillReceiveProps(props) {
        const {dispatch, windowType} = props;

        this.updateData();
    }

    updateData = () => {
        const {dispatch, windowType} = this.props;

        dispatch(viewLayoutRequest(windowType, "grid")).then(response => {
            this.setState(Object.assign({}, this.state, {
                layout: response.data,
                filters: response.data.filters
            }), () => {
                dispatch(createViewRequest(windowType, "grid", 20, [])).then((response) => {
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
        const {data,page} = this.state;

        this.getData(data.viewId, page, 20);
    }

    getData = (id, page, pages, sortingQuery) => {
        const {data} = this.state;
        const {dispatch} = this.props;

        dispatch(browseViewRequest(id, page, pages, sortingQuery)).then((response) => {
            this.setState(Object.assign({}, this.state, {
                data: response.data
            }))
        });
    }

    sortData = (ascending, field) => {
        const {sortingAsc, sortingField, test} = this.state;
        // console.log('ascending ' + ascending);
        const {data,page} = this.state;

        let sortingQuery = '';


        this.setState({sortingAsc: ascending}, function () {
            // console.log(this.state.sortingAsc);
        });



        

        this.setState(
            Object.assign({}, this.state, {
                test: 'bbb'
            }), ()=> {
                // console.log(test);
            }
        );

        // this.setState(
        //     Object.assign({}, this.state, {
        //         sortingAsc: ascending
        //     }), ()=> {
        //         console.log(sortingAsc);
        //     }
        // );

        this.setState(
            Object.assign({}, this.state, {
                sortingField: field
            })
        );

        // console.log('sort data');
        // console.log(sortingAsc + ' ' + sortingField);


        if(field && ascending) {
            sortingQuery = '+' + field;
            // this.setState(
            //     Object.assign({}, this.state, {
            //         page: 1
            //     })
            // );
        } else if(field && !ascending) {
            sortingQuery = '-' + field;
            // this.setState(
            //     Object.assign({}, this.state, {
            //         page: 1
            //     })
            // );
        }

        // console.log('view id:');
        // console.log(data.viewId);

        this.getData(data.viewId, page, 20, sortingQuery);
    }

    handleChangePage = (index) => {
        const {data, page} = this.state;
        const {sortingAsc, sortingField} = this.state;

        // console.log('a ' +sortingAsc + ' b ' + sortingField);

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
                this.getView(sortingAsc, sortingField);
            });
        }
    }

    render() {
        const {dispatch, windowType, breadcrumb} = this.props;
        const {layout, data, page} = this.state;
        // console.log(this.state.data);
        if( layout && data) {

            return (
                <div>
                    <Header breadcrumb={breadcrumb} />
                    <div className="container header-sticky-distance">
                        <div className="panel panel-primary panel-spaced panel-inline document-list-header">
                            <button
                                className="btn btn-meta-outline-secondary btn-distance btn-sm"
                                onClick={() => dispatch(push('/window/' + windowType + '/new'))}
                            >
                                <i className="meta-icon-add" /> New {layout.caption}
                            </button>
                            <span>Filters: </span>
                            <DatetimeRange />
                            <button className="btn btn-meta-outline-secondary btn-distance btn-sm">
                                <i className="meta-icon-preview" /> No search filters
                            </button>

                        </div>
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
                </div>
            );
        }else{
            return false;
        }

    }
}

function mapStateToProps(state) {
    const { windowHandler, menuHandler } = state;
    const {
        master,
        connectionError,
        modal
    } = windowHandler || {
        master: {},
        connectionError: false,
        modal: false
    }


    const {
        breadcrumb
    } = menuHandler || {
        breadcrumb: {}
    }

    return {
        master,
        connectionError,
        breadcrumb,
        modal
    }
}

DocList.propTypes = {
    dispatch: PropTypes.func.isRequired
};

DocList = connect(mapStateToProps)(DocList)

export default DocList;
