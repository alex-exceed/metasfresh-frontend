import React, { Component } from 'react';
import {connect} from 'react-redux';
import counterpart from 'counterpart';

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
    sendEmail,
    getEmail,
    getTemplates
} from '../../actions/EmailActions';

import RawList from '../widget/List/RawList'

class NewEmail extends Component {
    constructor(props){
        super(props);

        this.state = {
            init: false,
            cached: {},
            templates: [],
            template: {}
        }
    }

    componentWillMount = () => {
        const {windowId, docId, handleCloseEmail} = this.props;
        createEmail(windowId, docId).then(res => {
            this.setState({
                init: true,
                ...res.data,
                cached: res.data
            })
            this.getTemplates();
        }).catch(() => {
            handleCloseEmail();
        })
    }

    getEmail = (emailId) => {
        getEmail(emailId).then(res => {
            this.setState({
                init: true,
                ...res.data,
                cached: res.data
            })
        });
    }

    getTemplates = () => {
        getTemplates().then(res => {
            this.setState({
                templates: res.data.values
            })
        });
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

    handleTemplate=(option)=> {
        const {emailId, template} = this.state;
        if(template === option) return;

        patchRequest('mail', emailId, null, null, null, 'templateId', option)
            .then(res => {
               this.setState({
                   ...res.data,
                    template: option
                });
            })
    }

    render() {
        const {handleCloseEmail, windowId, docId} = this.props;
        const {
            init, attachments, emailId, subject, message, to,
            templates, template
        } = this.state;

        if(!init) return false;

        return (
            <div className="screen-freeze">
                <div className="panel panel-modal panel-email panel-modal-primary">
                    <div className="panel-email-header-wrapper">
                        <div className="panel-email-header panel-email-header-top">
                            <span className="email-headline">
                                {counterpart.translate('window.email.new')}
                            </span>
                            <div className="email-templates">
                                {templates.length>0 && <RawList
                                    rank="primary"
                                    list={templates}
                                    onSelect={
                                        option => this.handleTemplate(option)
                                    }
                                    selected={template}
                                />}
                            </div>

                            <div
                                className="input-icon input-icon-lg icon-email"
                                onClick={handleCloseEmail}
                            >
                                <i className="meta-icon-close-1"/>
                            </div>

                        </div>
                        <div className="panel-email-header panel-email-bright">
                            <div className="panel-email-data-wrapper">
                                <span className="email-label">
                                    {counterpart.translate('window.email.to')}:
                                </span>
                                <AutocompleteTo
                                    {...{windowId, docId, emailId, to}}
                                />
                            </div>
                        </div>
                        <div className="panel-email-header panel-email-bright">
                            <div className="panel-email-data-wrapper">
                                <span className="email-label">
                                    {counterpart.translate('window.email.topic')}:
                                </span>
                                <input
                                    className="email-input email-input-msg"
                                    type="text"
                                    onChange={e =>
                                        this.change('subject', e.target.value)}
                                    value={subject ? subject : ''}
                                    onBlur={
                                        () => this.patch('subject', subject)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="panel-email-body">
                        <textarea
                            value={message ? message : ''}
                            onChange={e =>
                                this.change('message', e.target.value)}
                            onBlur={() => this.patch('message', message)}
                        />
                    </div>
                    <div className="panel-email-footer">
                        <Attachments
                            getEmail={this.getEmail}
                            {...{attachments, emailId}} />
                        <button
                            onClick={this.send}
                            className="btn btn-meta-success btn-sm btn-submit"
                        >
                            {counterpart.translate('window.email.send')}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

NewEmail = connect()(NewEmail);

export default NewEmail;
