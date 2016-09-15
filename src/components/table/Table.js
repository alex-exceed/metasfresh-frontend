import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import update from 'react-addons-update';

import {
    openModal
} from '../../actions/WindowActions';

import TableFilter from './TableFilter';
import TableHeader from './TableHeader';
import TableContextMenu from './TableContextMenu';
import TableItem from './TableItem';
import Widget from '../Widget';


class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            listenOnKeys: true,
            contextMenu: {
                open: false,
                x: 0,
                y: 0
            }
        }
    }

    changeListenOnTrue = () => {
        this.setState(Object.assign({}, this.state, {
            listenOnKeys: true
        }))
    }

    changeListenOnFalse = () => {
        this.setState(Object.assign({}, this.state, {
            listenOnKeys: false
        }))
    }

    selectProduct = (id) => {
        this.setState(Object.assign({}, this.state, {
            selected: this.state.selected.concat([id])
        }))
    }

    selectRangeProduct = (ids) => {
        this.setState(Object.assign({}, this.state, {
            selected: ids
        }))
    }

    selectOneProduct = (id) => {
        this.setState(Object.assign({}, this.state, {
            selected: [id]
        }))
    }

    deselectProduct = (id) => {
        this.setState(update(this.state, {
            selected: {$splice: [[id, 1]]}
        }))
    }

    deselectAllProducts = () => {
        this.setState(Object.assign({}, this.state, {
            selected: []
        }))
     }


    handleClickOutside = (event) => {
        if(this.state.selected.length > 0){
            this.deselectAllProducts();
        }

    }

    handleKeyDown = (e) => {

        const {rowData, tabid, listenOnKeys} = this.props;
        const item = rowData[tabid];
        const {selected} = this.state;
        const selectRange = e.shiftKey;

        let nodeList = Array.prototype.slice.call( document.activeElement.parentElement.children);
        let idActive = nodeList.indexOf(document.activeElement);


        switch(e.key) {
            case "ArrowDown":
                e.preventDefault();

                const actualId = Object.keys(rowData[tabid]).findIndex(x => x === selected[selected.length-1])

                if(actualId < Object.keys(rowData[tabid]).length-1 ){
                    let newId = actualId+1;
                    // this.state.selected = [Object.keys(rowData[tabid])[newId]];
                    if(!selectRange) {
                        this.deselectAllProducts();
                    }

                    let t = this;
                    setTimeout(function(){
                        t.selectProduct(Object.keys(rowData[tabid])[newId]);
                        if(idActive > -1) {
                            document.getElementsByClassName('row-selected')[document.getElementsByClassName('row-selected').length-1].children[idActive].focus();
                        }
                    }, 1);
                }
                break;
            case "ArrowUp":
                e.preventDefault();

                const actual = Object.keys(rowData[tabid]).findIndex(x => x === selected[selected.length-1])

                if(actual > 0 ){
                    let newId = actual-1;

                    if(!selectRange) {
                        this.deselectAllProducts();
                    }

                    let t = this;
                    setTimeout(function(){
                        t.selectProduct(Object.keys(rowData[tabid])[newId]);
                        if(idActive > -1) {
                            document.getElementsByClassName('row-selected')[0].children[idActive].focus();
                        }
                    }, 1);
                }
                break;
            case "ArrowLeft":
                e.preventDefault();
                if(document.activeElement.previousSibling){
                    document.activeElement.previousSibling.focus();
                }
                break;
            case "ArrowRight":
                e.preventDefault();
                if(document.activeElement.nextSibling){
                   document.activeElement.nextSibling.focus();
                }
                break;
        }

    }

    closeContextMenu = (event) => {
        this.setState(Object.assign({}, this.state, {
            contextMenu: Object.assign({}, this.state.contextMenu, {
                open: false
            })
        }))
    }

    handleClick = (e, id) => {
       // e.preventDefault();

        const {dispatch} = this.props;
        const {selected} = this.state;
        const selectMore = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
        const selectRange = e.shiftKey;
        const isSelected = selected.indexOf(id) > -1;
        const isAnySelected = selected.length > 0;
        const isMoreSelected = selected.length > 1;

        if(selectMore){
            if(isSelected){
                this.deselectProduct(id);
            }else{
                this.selectProduct(id);
            }
        }else if(selectRange){
            if(isAnySelected){
                const idsToSelect = this.getProductRange(id);
                this.selectRangeProduct(idsToSelect);
            }else{
                this.selectOneProduct(id);
            }
        }else{
            if(isSelected){
                if(isMoreSelected){
                    this.selectOneProduct(id);
                }else{
                    // this.deselectAllProducts();
                }
            }else{
                this.selectOneProduct(id);
            }
        }
    }
    handleRightClick = (e, id) => {
        // const {selected} = this.state;
        // if(selected.length < 1) {
        //   this.selectProduct(id);
        // }


        const {selected} = this.state;
        const isAnySelected = selected.length > 0;

        if(!isAnySelected){
            this.selectProduct(id);
        } else if(selected.length === 1){
            this.deselectAllProducts();
            let t = this;
            setTimeout(function(){
                t.selectProduct(id);
            }, 1);

        }

        e.preventDefault();
        this.setState({
            contextMenu: {
                x: e.clientX,
                y: e.clientY,
                open: true
            }
        });
    }
    sumProperty = (items, prop) => {
        return items.reduce((a, b) => {
            return b[prop] == null ? a : a + b[prop];
        }, 0);
    }
    getProductRange = (id) => {
        const {rowData, tabid} = this.props;
        let selected = [
            Object.keys(rowData[tabid]).findIndex(x => x === id),
            Object.keys(rowData[tabid]).findIndex(x => x === this.state.selected[0])
        ];
        selected.sort((a,b) => a - b);
        return Object.keys(rowData[tabid]).slice(selected[0], selected[1]+1);
    }
    openModal = (windowType, tabId, rowId) => {
        const {dispatch} = this.props;
        dispatch(openModal("Add new", windowType, tabId, rowId));
    }

    renderTableBody = () => {
        const {rowData, tabid, cols, type, docId, readonly} = this.props;
        const {selected} = this.state;
        if(!!rowData && rowData[tabid]){
            let keys = Object.keys(rowData[tabid]);
            const item = rowData[tabid];
            let ret = [];
            for(let i=0; i < keys.length; i++) {
                const key = keys[i];
                ret.push(
                    <TableItem
                        fields={item[key].fields}
                        key={i}
                        rowId={item[key].rowId}
                        tabId={tabid}
                        cols={cols}
                        type={type}
                        docId={docId}
                        isSelected={selected.indexOf(item[key].rowId) > -1}
                        onMouseDown={(e) => this.handleClick(e, item[key].rowId)}
                        onContextMenu={(e) => this.handleRightClick(e, item[key].rowId)}
                        changeListenOnTrue={() => this.changeListenOnTrue()}
                        changeListenOnFalse={() => this.changeListenOnFalse()}
                        readonly={readonly}
                    />
                );
            }

            return ret;
        }
    }

    renderEmptyInfo = () => {
        const {emptyText, emptyHint} = this.props;
        return (
            <div className="empty-info-text">
                <div>
                    <h5>{emptyText}</h5>
                    <p>{emptyHint}</p>
                </div>
            </div>
        )
    }

    render() {
        const {cols, type, docId, rowData, tabid, readonly} = this.props;
        const {x,y,contextMenu,selected, listenOnKeys} = this.state;

        return (
            <div className="row">
                <div className="col-xs-12">
                    <TableContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        isDisplayed={contextMenu.open}
                        blur={() => this.closeContextMenu()}
                        docId={docId}
                        type={type}
                        tabId={tabid}
                        selected={selected}
                        deselect={() => this.deselectAllProducts()}
                    />
                    {!readonly && <div className="row">
                        <div className="col-xs-12">
                            <button className="btn btn-meta-outline-secondary btn-distance btn-sm pull-xs-left" onClick={() => this.openModal(type, tabid, "NEW")}>Add new</button>
                            <div className="pull-xs-right">
                                {/*<TableFilter />*/}
                            </div>
                        </div>
                    </div>}

                    <div className="panel panel-primary panel-bordered panel-bordered-force">
                        <table className="table table-bordered-vertically table-striped"  onKeyDown = { listenOnKeys ? (e) => this.handleKeyDown(e) : ''}>
                            <thead>
                                <TableHeader cols={cols} />
                            </thead>
                            <tbody>
                                {this.renderTableBody()}
                            </tbody>
                            <tfoot>
                            </tfoot>
                        </table>

                        {rowData && rowData[tabid] && Object.keys(rowData[tabid]).length === 0 && this.renderEmptyInfo()}
                    </div>
                </div>
            </div>
        )
    }
}

Table.propTypes = {
    dispatch: PropTypes.func.isRequired
}

Table = connect()(onClickOutside(Table))

export default Table
