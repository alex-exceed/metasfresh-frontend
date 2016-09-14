import React, { Component } from 'react';
import NavigationTreeSubitem from './NavigationTreeSubitem';
import MenuOverlayItem from './MenuOverlayItem';

class NavigationTreeItem extends Component {
    constructor(props){
        super(props);
    }
    render() {
        const {nodeId, elementId, caption, children, handleRedirect} = this.props;

        return (
            <div className="nav-tree-item">
                <span className="nav-tree-header" >
                    {caption}

                </span>
                {children && children.map((subitem, subindex) =>
                    <NavigationTreeSubitem
                        key={subindex}
                        handleRedirect={handleRedirect}
                        childArray={subitem.children}
                        {...subitem}
                    />
                )}
            </div>
        )
    }
}

export default NavigationTreeItem
