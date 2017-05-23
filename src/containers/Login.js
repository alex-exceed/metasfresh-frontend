import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import LoginForm from '../components/app/LoginForm';

class Login extends Component {
    constructor(props){
        super(props);
    }

    componentWillMount(){
        const {logged, dispatch} = this.props;
        if(logged){
            dispatch(push('/'));
        }
    }

    userBrowser = () => {

        const isChrome = !!window.chrome && !!window.chrome.webstore;

        const isFirefox = typeof InstallTrigger !== 'undefined';

        const isSafari = navigator.vendor &&
                        navigator.vendor.indexOf('Apple') > -1 &&
                        navigator.userAgent &&
                        !navigator.userAgent.match('CriOS');

        const isOpera = (!!window.opr && !!window.opr.addons) ||
                    !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        const isIE = /*@cc_on!@*/false || !!document.documentMode; // IE 6-11

        const isEdge = !isIE && !!window.StyleMedia;

        if(isChrome){
            return 'chrome';
        } else if(isFirefox){
            return 'firefox';
        } else if(isSafari) {
            return 'safari';
        } else if(isOpera) {
            return 'opera';
        } else if(isIE) {
            return 'ie'
        } else if(isEdge) {
            return 'edge'
        }
    }

    browserSupport = (...supportedBrowsers) => {

            const userBrowser = this.userBrowser();
            let isSupported = false;

            supportedBrowsers.map(browser => {
                if(userBrowser === browser){
                    isSupported = true;
                }
            });
            return isSupported;
    }

    render() {
        const {redirect, auth} = this.props;
        const isYourBrowserSupported = this.browserSupport('chrome');
        return (
            <div className="fullscreen">
                <div className="login-container">
                    <LoginForm
                        {...{redirect, auth}}
                     />
                    {! isYourBrowserSupported &&
                        <div className="browser-warning">
                            <p>Your browser might be not fully supported.</p>
                            <p>Please try Chrome in case of any errors.</p>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    dispatch: PropTypes.func.isRequired
}

Login = connect()(Login);

export default Login;
