import * as types from '../constants/ActionTypes'
import axios from 'axios';
import {replace} from 'react-router-redux';

export function loginSuccess(auth) {
    return dispatch => {
        localStorage.setItem('isLogged', true);

        dispatch(getNotificationsEndpoint()).then(topic => {
            auth.initNotificationClient(topic, msg => {
                const notification = JSON.parse(msg.body);

                if(notification.eventType === 'Read'){
                    dispatch(updateNotification(
                        notification.notification, notification.unreadCount
                    ));
                }else if(notification.eventType === 'New'){
                    dispatch(newNotification(
                        notification.notification, notification.unreadCount
                    ));
                    const notif = notification.notification;
                    if(notif.important){
                        dispatch(addNotification(
                            'Important notification', notif.message, 5000,
                            'primary'
                        ))
                    }
                }
            });
        })

        dispatch(getNotifications()).then(response => {
            dispatch(getNotificationsSuccess(
                response.data.notifications,
                response.data.unreadCount
            ));
        });
    }
}

export function logoutSuccess(auth) {
    return () => {
        auth.closeNotificationClient();
        localStorage.removeItem('isLogged');
    }
}

export function getUserLang() {
    return () => axios.get(config.API_URL + '/userSession/language');
}

export function setUserLang(payload) {
    return () => axios.put(config.API_URL + '/userSession/language', payload);
}

export function getAvailableLang() {
    return () => axios.get(config.API_URL + '/login/availableLanguages');
}

export function browseViewRequest(
    viewId, page, pageLength, orderBy, windowType
){
    return () => axios.get(
        config.API_URL +
        '/documentView/' +
        windowType + '/' +
        viewId +
        '?firstRow=' + pageLength * (page - 1) +
        '&pageLength=' + pageLength +
        (orderBy ? '&orderBy=' + orderBy : '')
    );
}

export function createViewRequest(
    windowType, viewType, pageLength, filters, refDocType = null,
    refDocId = null
){
    return () => axios.post(config.API_URL + '/documentView/' + windowType, {
        'documentType': windowType,
        'viewType': viewType,
        'referencing': (refDocType && refDocId) ? {
            'documentType': refDocType,
            'documentId': refDocId
        }: null,
        'filters': filters
    });
}

export function filterViewRequest(windowType, viewId, filters){
    return () => axios.post(config.API_URL + '/documentView/' + windowType +
    '/'+viewId+'/filter', {
        'filters': filters
    });
}

export function addNotification(title, msg, time, notifType, shortMsg){
    return {
        type: types.ADD_NOTIFICATION,
        title: title,
        msg: msg,
        shortMsg: shortMsg,
        time: time,
        notifType: notifType,
        id: Date.now()
    }
}

export function deleteNotification(key){
    return {
        type: types.DELETE_NOTIFICATION,
        key: key
    }
}

export function updateUri(pathname, query, prop, value) {
    return (dispatch) => {
        let url = pathname + '?';

        // add new prop or overwrite existing
        query[prop] = value;

        const queryKeys = Object.keys(query);

        for(let i = 0; i < queryKeys.length; i++){
            url += queryKeys[i] + '=' + query[queryKeys[i]] +
                (queryKeys.length - 1 !== i  ? '&': '');
        }

        dispatch(replace(url));
    }
}

export function loginRequest(username, password){
    return () => axios.post(
        config.API_URL +
        '/login/authenticate',
        { username, password }
    );
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

export function getAttributesInstance(
    attrType, tmpId, docType, docId, tabId, rowId, fieldName, entity
) {
    const type = entity === 'process' ? 'processId':'windowId';

    return () => axios.post(config.API_URL + '/' + attrType, {
        'templateId': tmpId,
        'source': {
            [type] : docType,
            'documentId': docId,
            'tabid': tabId,
            'rowId': rowId,
            'fieldName': fieldName
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

export function setProcessPending() {
    return {
        type: types.SET_PROCESS_STATE_PENDING
    }
}

export function setProcessSaved() {
    return {
        type: types.SET_PROCESS_STATE_SAVED
    }
}

export function getImageAction(id) {
    return axios({
        url: `${config.API_URL}/image/${id}`,
        responseType: 'blob'
    })
        .then(response => response.data);
}

export function postImageAction (data) {
    return axios.post(`${config.API_URL}/image`, data)
        .then(response => response.data);
}

export function getKPIsDashboard() {
    return () => axios.get(config.API_URL +
        '/dashboard/kpis?silentError=true');
}

export function getTargetIndicatorsDashboard() {
    return () => axios.get(config.API_URL +
        '/dashboard/targetIndicators?silentError=true');
}

export function getKPIData(id) {
    return () => axios.get(config.API_URL + '/dashboard/kpis/'+id+
        '/data?silentError=true');
}

export function getTargetIndicatorsData(id) {
    return () => axios.get(
        config.API_URL +
        '/dashboard/targetIndicators/' +
        id +
        '/data?silentError=true'
    );
}

export function setUserDashboardWidgets(payload) {
    return () => axios.patch(config.API_URL + '/dashboard/kpis', payload);
}
