import React, { Component } from 'react';
import {connect} from 'react-redux';

import Attachments from './Attachments';
import AutocompleteTo from './AutocompleteTo';

import {
    addNotification
} from '../../actions/AppActions';

import {
    patchRequest
} from '../../actions/GenericActions';

import {
    createEmail,
    sendEmail
} from '../../actions/EmailActions';

class NewEmail extends Component {
    constructor(props){
        super(props);

        this.state = {
            init: false,
            cached: {}
        }
    }
    
    componentWillMount = () => {
        const {dispatch, windowId, docId, handleCloseEmail} = this.props;
        createEmail(windowId, docId).then(res => {
            this.setState({
                init: true,
                ...res.data,
                cached: res.data
            })
        }).catch(err => {
            handleCloseEmail();
        })
    }
    
    change = (prop, value) => {
        this.setState({
            [prop]: value
        })
    }
    
    patch = (prop, value) => {
        const {emailId} = this.state;
        
        if(this.state.cached[prop] === value) return;
        
        patchRequest('mail', emailId, null, null, null, prop, value)
            .then(res => {
                this.setState({
                    ...res.data,
                    cached: res.data
                })
            })
    }
    
    send = () => {
        const {emailId} = this.state;
        const {handleCloseEmail, dispatch} = this.props;
        sendEmail(emailId).then(() => {
            handleCloseEmail();
            dispatch(addNotification(
                'Email', 'Email has been sent.', 5000, 'success'
            ));
        });
    }

    render() {
        const {handleCloseEmail, windowId, docId} = this.props;
        const {
            suggestions, tags, init, attachments, emailId, subject, message
        } = this.state;
        
        if(!init) return false;
        
        return (
            <div className="screen-freeze">
                <div className="panel panel-modal panel-email panel-modal-primary">
                    <div className="panel-email-header-wrapper">
                        <div className="panel-email-header panel-email-header-top">
                            New message
                            <div
                                className="input-icon input-icon-lg"
                                onClick={handleCloseEmail}
                            >
                                <i className="meta-icon-close-1"/>
                            </div>

                        </div>
                        <div className="panel-email-header panel-email-bright">
                            <div className="panel-email-data-wrapper">
                                <span>To:</span>
                                <AutocompleteTo
                                    {...{windowId, docId, emailId}}
                                />
                            </div>
                        </div>
                        <div className="panel-email-header panel-email-bright">
                            <div className="panel-email-data-wrapper">
                                <span>Topic:</span>
                                <input
                                    className="email-input email-input-msg"
                                    type="text"
                                    onChange={e =>
                                        this.change('subject', e.target.value)}
                                    value={subject}
                                    onBlur={
                                        () => this.patch('subject', subject)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="panel-email-body">
                        <textarea
                            value={message}
                            onChange={e =>
                                this.change('message', e.target.value)}
                            onBlur={() => this.patch('message', message)}
                        />
                    </div>
                    <div className="panel-email-footer">
                        <Attachments {...{attachments}} />
                        <button
                            onClick={this.send}
                            className="btn btn-meta-success btn-sm btn-submit"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

NewEmail = connect()(NewEmail);

export default NewEmail;
