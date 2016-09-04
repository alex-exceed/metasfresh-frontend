import * as types from '../constants/ActionTypes'
import axios from 'axios';
import config from '../config';


export function initLayoutSuccess(layout, scope) {
    return {
        type: types.INIT_LAYOUT_SUCCESS,
        layout: layout,
        scope: scope
    }
}
export function initDataSuccess(data, scope) {
    return {
        type: types.INIT_DATA_SUCCESS,
        data: data,
        scope: scope
    }
}
export function addRowData(data, scope) {
    return {
        type: types.ADD_ROW_DATA,
        data: data,
        scope: scope
    }
}
export function updateDataSuccess(item, scope) {
    return {
        type: types.UPDATE_DATA_SUCCESS,
        item: item,
        scope: scope
    }
}
export function updateRowSuccess(item,tabid,rowid,scope) {
    return {
        type: types.UPDATE_ROW_SUCCESS,
        item: item,
        tabid: tabid,
        rowid: rowid,
        scope: scope
    }
}
export function addNewRow(item,tabid,rowid,scope) {
    return {
        type: types.ADD_NEW_ROW,
        item: item,
        tabid: tabid,
        rowid: rowid,
        scope: scope
    }
}

export function updateDataProperty(property, value, scope){
    return {
        type: types.UPDATE_DATA_PROPERTY,
        property: property,
        value: value,
        scope: scope
    }
}

export function updateRowProperty(property, value, tabid, rowid, scope){
    return {
        type: types.UPDATE_ROW_PROPERTY,
        property: property,
        value: value,
        tabid: tabid,
        rowid: rowid,
        scope: scope
    }
}

export function noConnection(status){
    return {
        type: types.NO_CONNECTION,
        status: status
    }
}

export function openModal(windowType){
    return {
        type: types.OPEN_MODAL,
        windowType: windowType
    }
}
export function closeModal(){
    return {
        type: types.CLOSE_MODAL
    }
}


// INDICATOR ACTIONS
export function showLoaderIndicator(){
    return {
        type: types.CHANGE_INDICATOR_STATE,
        state: 'pending'
    }
}

export function showSavedIndicator(){
    return {
        type: types.CHANGE_INDICATOR_STATE,
        state: 'saved'
    }
}

export function showErrorIndicator(){
    return {
        type: types.CHANGE_INDICATOR_STATE,
        state: 'error'
    }
}

// THUNK ACTIONS

/*
 * Main method to generate window
 */
export function createWindow(windowType, docId = "NEW", isModal = false){
    return (dispatch) => {
        // this chain is really important,
        // to do not re-render widgets on init
        dispatch(initWindow(windowType, docId))
            .then(response => {
                docId = response.data[0].id;
                const preparedData = nullToEmptyStrings(response.data[0].fields);
                dispatch(initDataSuccess(preparedData, getScope(isModal)))
            }).then(response =>
                dispatch(initLayout(windowType))
            ).then(response =>
                dispatch(initLayoutSuccess(response.data, getScope(isModal)))
            ).then(response => {
                let tabTmp = {};

                response.layout.tabs.map(tab => {
                    tabTmp[tab.tabid] = {};
                    dispatch(getData(windowType, docId, tab.tabid))
                        .then((res)=> {

                            res.data.map(row => {
                                tabTmp[tab.tabid][row.rowId] = row;
                            });
                            dispatch(addRowData(tabTmp, getScope(isModal)));
                        })
                })
            }).catch((e)=>{
                console.log(e);
            })
    }
}

export function initWindow(windowType, docId) {
    return (dispatch) => {
        if(docId === "NEW"){
            return dispatch(patchRequest(windowType, docId))
        }else{
            return dispatch(getData(windowType, docId))
        }
    }
}

export function patchRequest(windowType, id = "NEW", tabId, rowId, property, value) {
    let payload = {};

    if(id === "NEW"){
        payload = [];
    }else{
        if(property && value !== undefined){
            payload = [{
                'op': 'replace',
                'path': property,
                'value': value
            }];
        }else {
            payload = [];
        }
    }


    return dispatch => axios.patch(
        config.API_URL +
        '/window/commit?type=' +
        windowType +
        '&id=' + id +
        (tabId ? "&tabid=" + tabId : "") +
        (rowId ? "&rowId=" + rowId : "")
        , payload);
}

/*
 *  Wrapper for patch request of widget elements
 *  when responses should merge store
 */
export function patch(windowType, id = "NEW", tabId, rowId, property, value, isModal) {
    return dispatch => {
        dispatch(patchRequest(windowType, id, tabId, rowId, property, value)).then(response => {
            response.data.map(item1 => {
                if(rowId === "NEW"){
                    dispatch(addNewRow(item1, item1.tabid, item1.rowId, getScope(isModal)))
                }else{
                    item1.fields.map(item2 => {
                        if(rowId){
                            dispatch(updateRowSuccess(item2, item1.tabid, item1.rowId, getScope(isModal)))
                        }else{
                            dispatch(updateDataSuccess(item2, getScope(isModal)));
                        }
                    });
                }
            })
        })
    }
}

export function updateProperty(property, value, tabid, rowid, isModal){
    return dispatch => {
        if( tabid && rowid ){
            dispatch(updateRowProperty(property, value, tabid, rowid, getScope(isModal)))
        }else{
            dispatch(updateDataProperty(property, value, getScope(isModal)))
        }
    }
}

export function initLayout(windowType){
    return dispatch => axios.get(config.API_URL + '/window/layout?type=' + windowType);
}

export function getData(windowType, id, tabId, rowId) {
    return dispatch => axios.get(
        config.API_URL +
        '/window/data?type=' + windowType +
        '&id=' + id +
        (tabId ? "&tabid=" + tabId : "") +
        (rowId ? "&rowid=" + rowId : "")
    );
}

// UTILITIES

function getScope(isModal) {
    return isModal ? "modal" : "master";
}


function nullToEmptyStrings(arr){
    return arr.map(item =>
        (item.value === null) ?
        Object.assign({}, item, { value: "" }) :
        item
    )
}

export function findRowByPropName(arr, name) {
    let ret = -1;

    if(!arr){
        return ret;
    }

    for(let i = 0; i < arr.length; i++){
        if(arr[i].field === name){
            ret = arr[i];
            break;
        }
    }

    return ret;
}
