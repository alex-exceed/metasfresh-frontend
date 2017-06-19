import React, { Component } from 'react';
import defaultAvatar from '../../assets/images/default-avatar.png';
import {getAvatar} from '../../actions/AppActions';

class Avatar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {src, size, className, id, title} = this.props;
        return (
            <img
                src={id ? getAvatar(id) : defaultAvatar}
                title={title}
                className={
                    'avatar img-fluid rounded-circle ' + 
                    (size ? 'avatar-' + size + ' ' : '') +
                    (className ? className : '')
                } 
            />
        );
    }
}

export default Avatar;
