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
    getAvailableLang
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
            
            // Dashboard disabled notifications
            if(window.location.pathname === "/"){
                return;
            }
            
            store.dispatch(addNotification(
                'Error: ' + data.message.split(' ', 4).join(' ') + '...',
                data.message, 5000, 'error', errorTitle)
            );
        }
    }

    return Promise.reject(error);
});

export default class App extends Component {
    constructor() {
        super();

        store.dispatch(getAvailableLang()).then(response => {
            if(response.data.values.indexOf(navigator.language)){
                Moment.locale(navigator.language);
            }else{
                Moment.locale(response.data.defaultValue);
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
