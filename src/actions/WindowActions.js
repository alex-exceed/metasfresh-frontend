import * as types from '../constants/ActionTypes'
import axios from 'axios';
import config from '../config';
import {push, replace} from 'react-router-redux';

import {
    getWindowBreadcrumb
} from './MenuActions';

import {
    clearListProps
} from './ListActions';


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

export function deleteRow(tabid,rowid,scope) {
    return {
        type: types.DELETE_ROW,
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

export function openModal(title, windowType, type, tabId, rowId){
    return {
        type: types.OPEN_MODAL,
        windowType: windowType,
        modalType: type,
        tabId: tabId,
        rowId: rowId,
        title: title
    }
}

export function closeModal(){
    return {
        type: types.CLOSE_MODAL
    }
}
export function updateModal (rowId) {
    return {
        type: types.UPDATE_MODAL,
        rowId: rowId
    }
}

// INDICATOR ACTIONS

export function indicatorState(state){
    return {
        type: types.CHANGE_INDICATOR_STATE,
        state: state
    }
}


// THUNK ACTIONS

/*
 * Main method to generate window
 */
export function createWindow(windowType, docId = "NEW", tabId, rowId, isModal = false){
    return (dispatch) => {
        if(docId == "new"){
            docId = "NEW";
        }

        // this chain is really important,
        // to do not re-render widgets on init
        return dispatch(initWindow(windowType, docId, tabId, rowId))
            .then(response => {

                if(docId == "NEW" && !isModal){
                    dispatch(clearListProps());
                    dispatch(replace("/window/"+ windowType + "/" + response.data[0].id));
                }

                docId = response.data[0].id;
                const preparedData = nullToEmptyStrings(response.data[0].fields);

                dispatch(initDataSuccess(preparedData, getScope(isModal)));

                if(isModal && rowId === "NEW"){
                    dispatch(mapDataToState([response.data[0]], false, "NEW"))
                    dispatch(updateModal(response.data[0].rowId));
                }

                if(!isModal){
                    dispatch(getWindowBreadcrumb(windowType));
                }
            }).then(() =>
                dispatch(initLayout(windowType, tabId))
            ).then(response =>
                dispatch(initLayoutSuccess(response.data, getScope(isModal)))
            ).then(response => {
                let tabTmp = {};

                response.layout.tabs && response.layout.tabs.map(tab => {
                    tabTmp[tab.tabid] = {};
                    dispatch(getData(windowType, docId, tab.tabid))
                        .then((res)=> {

                            res.data && res.data.map(row => {
                                row.fields = nullToEmptyStrings(row.fields);
                                tabTmp[tab.tabid][row.rowId] = row;
                            });
                            dispatch(addRowData(tabTmp, getScope(isModal)));
                        })
                })
            });
    }
}

export function initWindow(windowType, docId, tabId, rowId = null) {
    return (dispatch) => {
        if(docId === "NEW"){
            return dispatch(patchRequest(windowType, docId))
        }else{
            if(rowId === "NEW"){
                return dispatch(patchRequest(windowType, docId, tabId, "NEW"))
            }else if(rowId){
                return dispatch(getData(windowType, docId, tabId, rowId))
            }else{
                return dispatch(getData(windowType, docId))
            }
        }
    }
}

export function patchRequest(windowType, id = "NEW", tabId, rowId, property, value, entity) {
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

    // Temporary solution, TODO after API endpoints unification
    if(entity){
        return () => axios.patch(
            config.API_URL +
            '/'+ entity + '/instance/' + id +'/parameters'
            , payload);
    }else{
        return () => axios.patch(
            config.API_URL +
            '/window/commit?type=' +
            windowType +
            '&id=' + id +
            (tabId ? "&tabid=" + tabId : "") +
            (rowId ? "&rowId=" + rowId : "")
            , payload);
    }

}

/*
 *  Wrapper for patch request of widget elements
 *  when responses should merge store
 */
export function patch(windowType, id = "NEW", tabId, rowId, property, value, isModal, entity) {
    return dispatch => {
        let responsed = false;

        dispatch(indicatorState('pending'));
        let time = 0
        let timeoutLoop = () => {
            setTimeout(function(){
                time = 999;
                if(responsed){
                    dispatch(indicatorState('saved'));
                } else {
                    timeoutLoop();
                }
            }, time);
        }
        timeoutLoop();

        return dispatch(patchRequest(windowType, id, tabId, rowId, property, value, entity)).then(response => {
            responsed = true;

            dispatch(mapDataToState(response.data, isModal, rowId));
        })
    }
}

function mapDataToState(data, isModal, rowId){
    return (dispatch) => {
        data.map(item1 => {

            item1.fields = nullToEmptyStrings(item1.fields);

            if(rowId === "NEW"){
                dispatch(addNewRow(item1, item1.tabid, item1.rowId, "master"))
            }else{
                item1.fields.map(item2 => {
                    if(rowId && !isModal){
                        dispatch(updateRowSuccess(item2, item1.tabid, item1.rowId, getScope(isModal)));
                    }else{
                        if(rowId){
                            dispatch(updateRowSuccess(item2, item1.tabid, item1.rowId, getScope(false)));
                        }
                        dispatch(updateDataSuccess(item2, getScope(isModal)));
                    }
                });
            }
        })
    }
}

export function updateProperty(property, value, tabid, rowid, isModal){
    return dispatch => {
        if( tabid && rowid ){
            dispatch(updateRowProperty(property, value, tabid, rowid, "master"))
            if(isModal){
                dispatch(updateDataProperty(property, value, "modal"))
            }
        }else{
            dispatch(updateDataProperty(property, value, getScope(isModal)))
            if(isModal){
                //update the master field too if exist
                dispatch(updateDataProperty(property, value, "master"))
            }
        }
    }
}


// PROCESS ACTIONS

export function createProcess(processType){
    return (dispatch) => {
        return dispatch(getProcessData(processType)
            ).then(response => {
                const preparedData = nullToEmptyStrings(response.data.parameters);
                const pinstanceId = response.data.pinstanceId;
                if(preparedData.length === 0){
                    throw new Error('wrong_response');
                }
                dispatch(initDataSuccess(preparedData, "modal"));
            }).then(response =>
                dispatch(getProcessLayout(processType))
            ).then(response =>{
                const preparedLayout = Object.assign({}, response.data, {
                    pinstanceId: pinstanceId
                })
                return dispatch(initLayoutSuccess(preparedLayout, "modal"))
            });
    }
}

function getProcessData(processType) {
    return () => axios.put(config.API_URL + '/process/instance?processId=' + processType);
}

function getProcessLayout(processType) {
    return () => axios.get(config.API_URL + '/process/layout?processId=' + processType);
}

// END PROCESS ACTIONS


export function initLayout(windowType, tabId){
    return () => axios.get(
        config.API_URL +
        '/window/layout?type=' + windowType +
        (tabId ? "&tabid=" + tabId : "")
    );
}

export function getData(windowType, id, tabId, rowId) {
    return () => axios.get(
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

export function getItemsByProperty(arr, prop, value) {
    let ret = [];

    arr.map((item) => {
        if(item[prop] === value){
            ret.push(item);
        }
    });

    return ret;
}

export function printDoc(windowType, id) {
    return () => axios.get(
        config.API_URL +
        '/window/documentPrint?type=' + windowType +
        '&id=' + id
    );
}

//DELETE
export function deleteData(windowType, id, tabId, rowId) {
    return () => axios.delete(
        config.API_URL +
        '/window/delete?type=' + windowType +
        '&id=' + id +
        (tabId ? "&tabid=" + tabId : "") +
        (rowId ? "&rowId=" + rowId : "")
    );
}

export function deleteLocal(tabid,rowsid,scope) {
    return (dispatch) => {
        for (let rowid of rowsid) {
            dispatch(deleteRow(tabid,rowid,scope))
        }
    }
}
