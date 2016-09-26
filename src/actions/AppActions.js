import * as types from '../constants/ActionTypes'
import axios from 'axios';
import config from '../config';

export function autocompleteRequest(windowType, propertyName, query, id = "NEW") {
    query = encodeURIComponent(query);
    return (dispatch) => axios.get(config.API_URL + '/window/typeahead?type=' + windowType + '&id='+id+'&field='+ propertyName +'&query=' + query);
}

export function dropdownRequest(windowType, propertyName, id, tabId, rowId) {
    return (dispatch) => axios.get(
        config.API_URL +
        '/window/dropdown?type=' + windowType +
        '&id=' + id +
        '&field=' + propertyName+
        (tabId ? "&tabid=" + tabId : "") +
        (rowId ? "&rowId=" + rowId : "")
    );
}

export function viewLayoutRequest(windowType, type){
    return (dispatch) => axios.get(config.API_URL + '/window/viewLayout?type=' + windowType + '&viewType=' + type);
}

export function browseViewRequest(viewId, page, pageLength){
    return (dispatch) => {
        const firstRow = pageLength * (page - 1);
        return axios.get(config.API_URL + '/window/view/' + viewId + '?firstRow=' + firstRow + '&pageLength=' + pageLength)
    }
}

export function createViewRequest(windowType, viewType, pageLength, filters){
    return (dispatch) => axios.put(config.API_URL + '/window/view?type=' + windowType + '&viewType=' + viewType, filters);
}
