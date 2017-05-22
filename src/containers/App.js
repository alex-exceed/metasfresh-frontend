import React, { Component } from 'react';
import { Provider } from 'react-redux';
import axios from 'axios';

import configureStore from '../store/configureStore';
import { getRoutes } from '../routes.js';

import { syncHistoryWithStore, push } from 'react-router-redux';
import { Router, browserHistory } from 'react-router';

import Moment from 'moment';

import NotificationHandler
    from '../components/notifications/NotificationHandler';

import {
    noConnection
} from '../actions/WindowActions'

import {
    addNotification,
    logoutSuccess,
    getAvailableLang,
    setProcessSaved
} from '../actions/AppActions';

import '../assets/css/styles.css';

const store = configureStore(browserHistory);
const history = syncHistoryWithStore(browserHistory, store);

axios.defaults.withCredentials = true;

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if(!error.response){
        store.dispatch(noConnection(true));
    }

    /*
     * Authorization error
     */
    if(error.response.status == 401){
        store.dispatch(setProcessSaved());
        store.dispatch(logoutSuccess());
        store.dispatch(push('/login?redirect=true'));
    }else if(error.response.status != 404){
        if(localStorage.isLogged){
            const errorMessenger = (code) => {
                switch(code){
                    case 500:
                        return 'Server error';
                    case 400:
                        return 'Client error';
                }
            }
            const {
                data, status
            } = error.response;

            const errorTitle = errorMessenger(status);

            console.error(data.message);

            // Chart disabled notifications
            if(error.response.request.responseURL.includes('silentError=true')){
                return;
            }

            store.dispatch(addNotification(
                'Error: ' + data.message.split(' ', 4).join(' ') + '...',
                data.message, 5000, 'error', errorTitle)
            );
        }
    }
    if(error.response.request.responseURL.includes('showError=true')){
        const {
            data
        } = error.response;

        store.dispatch(addNotification(
            'Error: ' + data.message.split(' ', 4).join(' ') + '...',
            data.message, 5000, 'error', '')
        );
    } else {
        return Promise.reject(error);
    }
});

export default class App extends Component {
    constructor() {
        super();

        store.dispatch(getAvailableLang()).then(response => {
            const {defaultValue, values} = response.data;
            const valuesFlatten = values.map(item => Object.keys(item)[0]);

            if(valuesFlatten.indexOf(navigator.language)){
                Moment.locale(navigator.language);
            }else{
                Moment.locale(defaultValue);
            }
        });
    }

    render() {
        return (
            <Provider store={store}>
                <NotificationHandler>
                    <Router
                        history={history}
                        routes={getRoutes(store)}
                    />
                </NotificationHandler>
            </Provider>
        )
    }
}
