import React, { Component } from 'react';
import { Shortcuts } from 'react-shortcuts';

class ModalContextShortcuts extends Component {
    constructor(props){
        super(props);
    }

    blurActiveElement = () => {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.blur) {
            activeElement.blur();
        }
    }

    handleShortcuts = (action, event) => {
        const {apply, cancel} = this.props;

        switch (action) {
            case 'APPLY':
                event.preventDefault();

                this.blurActiveElement();

                apply && apply();

                break;
            case 'CANCEL':
                event.preventDefault();
                cancel && cancel();
                break;
        }
    }

    render() {
        return (
        <Shortcuts
            name="MODAL_CONTEXT"
            handler = { this.handleShortcuts }
            targetNodeSelector = "body"
            isolate = { true }
            preventDefault = { true }
            stopPropagation = { true }
            alwaysFireHandler = { true }
        />
        )
    }
}

export default ModalContextShortcuts;
