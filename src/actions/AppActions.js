import * as types from '../constants/ActionTypes'
import axios from 'axios';
import {replace} from 'react-router-redux';
import SockJs from 'sockjs-client';
import Stomp from 'stompjs/lib/stomp.min.js';
import qs from 'qs';

export function loginSuccess() {
	return dispatch => {
		/** global: localStorage */
		localStorage.setItem('isLogged', true);

        dispatch(getNotificationsEndpoint()).then(topic => {
            let sock = new SockJs(config.WS_URL);
            let client = Stomp.Stomp.over(sock);
            client.debug = null;

            client.connect({}, frame => {
                client.subscribe(topic.data, msg => {
                    const notification = JSON.parse(msg.body);

                    if(notification.eventType === "Read"){
                        dispatch(updateNotification(notification.notification, notification.unreadCount));
                    }else if(notification.eventType === "New"){
                        dispatch(newNotification(notification.notification, notification.unreadCount));
                        const notif = notification.notification;
                        if(notif.important){
                            dispatch(addNotification("Important notification", notif.message, 5000, "primary"))
                        }
                    }
                });
            })
        })

        dispatch(getNotifications()).then(response => {
            dispatch(getNotificationsSuccess(
                response.data.notifications,
                response.data.unreadCount
            ));
        });
	}
}

export function logoutSuccess() {
	return () => {
		/** global: localStorage */
		localStorage.removeItem('isLogged');
	}
}

export function getUserLang() {
    return () => axios.get(config.API_URL + '/userSession/language');
}

export function getAvailableLang() {
    return () => axios.get(config.API_URL + '/login/availableLanguages');
}

export function autocompleteRequest(docType, propertyName, query, docId, tabId, rowId, entity, subentity, subentityId) {
    return () => axios.get(
        config.API_URL +
        '/' + entity + '/' + docType + '/' + docId +
        (tabId ? "/" + tabId : "") +
        (rowId ? "/" + rowId : "") +
        (subentity ? "/" + subentity : "") +
        (subentityId ? "/" + subentityId : "") +
        '/attribute/' + propertyName +
        '/typeahead' + '?query=' + encodeURIComponent(query)
    );
}

export function dropdownRequest(docType, propertyName, docId, tabId, rowId, entity, subentity, subentityId) {
    return () => axios.get(
        config.API_URL +
        '/' + entity + '/' + docType + '/' + docId +
        (tabId ? "/" + tabId : "") +
        (rowId ? "/" + rowId : "") +
        (subentity ? "/" + subentity : "") +
        (subentityId ? "/" + subentityId : "") +
        '/attribute/' + propertyName +
        '/dropdown'
    );
}

export function getUserDashboardWidgets() {
    return () => axios.get(config.API_URL + '/dashboard/kpis');
}

export function setUserDashboardWidgets(payload) {
    return () => axios.patch(config.API_URL + '/dashboard/kpis', payload);
}

export function getUserDashboardIndicators() {
    return () => axios.get(config.API_URL + '/dashboard/targetIndicators');
}

export function viewLayoutRequest(windowType, type){
	return () => axios.get(config.API_URL + '/documentView/layout?type=' + windowType + '&viewType=' + type);
}

export function browseViewRequest(viewId, page, pageLength, orderBy){
	return () => axios.get(config.API_URL + '/documentView/' + viewId + '?firstRow=' + pageLength * (page - 1) + '&pageLength=' + pageLength + (orderBy ? '&orderBy=' + orderBy : ''));
}

export function createViewRequest(windowType, viewType, pageLength, filters, refDocType = null, refDocId = null){
    // TODO: waiting for unification of that enpoint, end than we should remove ending slash
	return () => axios.post(config.API_URL + '/documentView/', {
        "documentType": windowType,
        "viewType": viewType,
        "referencing": (refDocType && refDocId) ? {
            "documentType": refDocType,
            "documentId": refDocId
        }: null,
        "filters": filters
    });
}

export function addNotification(title, msg, time, notifType){
	return {
		type: types.ADD_NOTIFICATION,
		title: title,
		msg: msg,
		time: time,
		notifType: notifType
	}
}

export function deleteNotification(id){
	return {
		type: types.DELETE_NOTIFICATION,
		id: id
	}
}

export function updateUri(pathname, query, prop, value) {
	return (dispatch) => {
		let url = pathname;
		url += "?";

		// add new prop
		// or overwrite existing
		query[prop] = value;

		const queryKeys = Object.keys(query);

		for(let i = 0; i < queryKeys.length; i++){
			url += queryKeys[i] + "=" + query[queryKeys[i]] + (queryKeys.length - 1 !== i  ? "&": "");
		}

		dispatch(replace(url));
	}
}

export function loginRequest(login, passwd){
	return () => axios.post(config.API_URL + '/login/authenticate?username=' + login + '&password=' + passwd);
}

export function localLoginRequest(){
	return () => axios.get(config.API_URL + '/login/isLoggedIn');
}

export function loginCompletionRequest(role){
	return () => axios.post(config.API_URL + '/login/loginComplete', role);
}

export function logoutRequest(){
	return () => axios.get(config.API_URL + '/login/logout');
}

export function filterDropdownRequest(type, filterId, parameterName) {
	return () => axios.get(config.API_URL + '/documentView/filters/parameter/dropdown?type=' + type + '&filterId=' + filterId + '&parameterName=' + parameterName);
}

export function filterAutocompleteRequest(type, filterId, parameterName, query) {
	return () => {
		query = encodeURIComponent(query);
		return axios.get(config.API_URL + '/documentView/filters/parameter/typeahead?type=' + type + '&filterId=' + filterId + '&parameterName=' + parameterName +'&query=' + query);
	}
}

export function getNotifications() {
    return () => axios.get(config.API_URL + '/notifications/all?limit=20');
}

export function getNotificationsEndpoint() {
    return () => axios.get(config.API_URL + '/notifications/websocketEndpoint');
}

export function markAllAsRead() {
    return () => axios.put(config.API_URL + '/notifications/all/read');
}

export function markAsRead(id) {
    return () => axios.put(config.API_URL + '/notifications/' + id + '/read');
}

// Attribute widget backend

export function getAttributesLayout(attrType, docId) {
    return () => axios.get(config.API_URL + '/' + attrType + '/' + docId + '/layout');
}

export function attributesComplete(attrType, docId) {
    return () => axios.get(config.API_URL + '/' + attrType + '/' + docId + '/complete');
}

export function getAttributesInstance(attrType, tmpId, docType, docId, tabId, rowId, fieldName) {
    return () => axios.post(config.API_URL + '/' + attrType, {
        "templateId": tmpId,
        "source": {
            "documentType": docType,
            "documentId": docId,
            "tabid": tabId,
            "rowId": rowId,
            "fieldName": fieldName
        }
    });
}


export function getNotificationsSuccess(notifications, unreadCount) {
    return {
        type: types.GET_NOTIFICATIONS_SUCCESS,
        notifications: notifications,
        unreadCount: unreadCount
    }
}

export function updateNotification(msg, count) {
    return {
        type: types.UPDATE_NOTIFICATION,
        notification: msg,
        unreadCount: count
    }
}

export function newNotification(msg, count) {
    return {
        type: types.NEW_NOTIFICATION,
        notification: msg,
        unreadCount: count
    }
}
