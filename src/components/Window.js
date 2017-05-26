import React, { Component } from 'react';

import Dropzone from './Dropzone';
import Separator from './Separator';

import {
    findRowByPropName
} from '../actions/WindowActions';

import MasterWidget from '../components/widget/MasterWidget';
import Tabs from '../components/tabs/Tabs';
import Table from '../components/table/Table';

class Window extends Component {
    constructor(props){
        super(props);

        this.state = {
            fullScreen: null,
            dragActive: false
        };

        if(props.isModal){
            this.tabIndex = {
                firstColumn: 0,
                tabs: 0,
                secondColumn: 0
            }
        }else{
            this.tabIndex = {
                firstColumn: 1,
                tabs: 2,
                secondColumn: 3
            }
        }
    }

    toggleTableFullScreen = (tabId) => {
        this.setState({
            fullScreen: tabId
        });
    }

    renderTabs = (tabs) => {
        const {type} = this.props.layout;
        const {data, rowData, newRow, tabsInfo, sort} = this.props;
        const {fullScreen} = this.state;
        const dataId = findRowByPropName(data, 'ID').value;

        return(
            <Tabs
                tabIndex={this.tabIndex.tabs}
                toggleTableFullScreen={this.toggleTableFullScreen}
                fullScreen={fullScreen}
                windowType={type}
            >
                {tabs.map(elem => {
                    const {
                        tabid, caption, elements, emptyResultText,
                        emptyResultHint, queryOnActivate, supportQuickInput,
                        orderBy
                    } = elem;
                    return (
                        <Table
                            entity="window"
                            caption={caption}
                            key={tabid}
                            rowData={rowData}
                            cols={elements}
                            tabid={tabid}
                            type={type}
                            sort={sort}
                            orderBy={orderBy}
                            docId={dataId}
                            emptyText={emptyResultText}
                            emptyHint={emptyResultHint}
                            newRow={newRow}
                            tabIndex={this.tabIndex.tabs}
                            queryOnActivate={queryOnActivate}
                            supportQuickInput={supportQuickInput}
                            tabInfo={tabsInfo && tabsInfo[tabid]}
                            disconnectFromState={true}
                        />
                    )
                })}
            </Tabs>
        )
    }

    renderSections = (sections) => {
        return sections.map((elem, id)=> {
            const {title, columns} = elem;
            const isFirst = (id === 0);
            return (
                <div className="row" key={'section' + id}>
                    {title && <Separator {...{title}} />}
                    {columns && this.renderColumns(columns, isFirst)}
                </div>
            )
       })
    }

    renderColumns = (columns, isSectionFirst) => {
        const maxRows = 12;
        const colWidth = Math.floor(maxRows / columns.length);
        return columns.map((elem, id)=> {
            const isFirst = id === 0 && isSectionFirst;
            const elementGroups = elem.elementGroups;
            return (
                <div className={'col-sm-' + colWidth} key={'col' + id}>
                    {elementGroups &&
                        this.renderElementGroups(elementGroups, isFirst)
                    }
                </div>
            )
        })
    }

    renderElementGroups = (group, isFirst) => {
        const {isModal} = this.props;
        return group.map((elem, id)=> {
            const {type, elementsLine} = elem;
            const shouldBeFocused = isFirst && (id === 0);

            const tabIndex = (type === 'primary') ?
                this.tabIndex.firstColumn:
                this.tabIndex.secondColumn;

            return (
                elementsLine && elementsLine.length > 0 &&
                    <div
                        key={'elemGroups' + id}
                        ref={c => isModal && shouldBeFocused && c && c.focus()}
                        tabIndex={shouldBeFocused ? 0 : undefined}
                        className={
                            'panel panel-spaced panel-distance ' +
                            ((type === 'primary') ?
                                'panel-bordered panel-primary' :
                                'panel-secondary'
                            )
                        }
                    >
                        {this.renderElementsLine(
                            elementsLine, tabIndex, shouldBeFocused
                        )}
                    </div>
            )
        })
    }

    renderElementsLine = (elementsLine, tabIndex, shouldBeFocused) => {
        return elementsLine.map((elem, id)=> {
            const {elements} = elem;
            const isFocused = shouldBeFocused && (id === 0);
            return (
                elements && elements.length > 0 &&
                    <div className="elements-line" key={'line' + id}>
                        {this.renderElements(elements, tabIndex, isFocused)}
                    </div>
            )
        })
    }

    renderElements = (elements, tabIndex, isFocused) => {
        const {type} = this.props.layout;
        const {data, modal, tabId, rowId, dataId, isAdvanced} = this.props;
        const {fullScreen} = this.state;

        return elements.map((elem, id)=> {
            const autoFocus = isFocused && (id === 0);
            const widgetData = elem.fields.map(item =>
                findRowByPropName(data, item.field)
            );
            const relativeDocId = findRowByPropName(data, 'ID').value;
            return (
                <MasterWidget
                    entity="window"
                    key={'element' + id}
                    windowType={type}
                    dataId={dataId}
                    widgetData={widgetData}
                    isModal={!!modal}
                    tabId={tabId}
                    rowId={rowId}
                    relativeDocId={relativeDocId}
                    isAdvanced={isAdvanced}
                    tabIndex={tabIndex}
                    autoFocus={autoFocus}
                    fullScreen={fullScreen}
                    {...elem}
                />
            )
        })
    }

    render() {
        const {sections, tabs} = this.props.layout;
        const {
            handleDropFile, handleRejectDropped, handleDragStart, isModal
        } = this.props;

        return (
            <div key="window" className="window-wrapper">
                <Dropzone
                    handleDropFile={handleDropFile}
                    handleRejectDropped={handleRejectDropped}
                    handleDragStart={handleDragStart}
                >
                    <div className="sections-wrapper">
                        {sections && this.renderSections(sections)}
                    </div>
                </Dropzone>
                {
                    !isModal &&
                    <div className="mt-1 tabs-wrapper">
                        {tabs && this.renderTabs(tabs)}
                    </div>
                }
            </div>
        );
    }
}

export default Window;
