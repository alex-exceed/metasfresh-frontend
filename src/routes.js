import React from 'react';
import { Router, Route, IndexRoute, NoMatch } from 'react-router';

import Main from './containers/Main.js';
import Dashboard from './containers/Dashboard.js';
import MasterWindow from './containers/MasterWindow.js';
import DocList from './containers/DocList.js';
import NavigationTree from './containers/NavigationTree.js';

import {
    createWindow
} from './actions/WindowActions';

export const getRoutes = (store) => {
    return (
        <Route path="/">
            <Route component={Main}>
                <IndexRoute component={Dashboard} />
            </Route>
            <Route path="/window/:windowType"
                component={(nextState) => <DocList windowType={nextState.params.windowType} />}
            />
            <Route path="/window/:windowType/:docId"
                component={MasterWindow}
                onEnter={(nextState) => store.dispatch(createWindow(nextState.params.windowType, nextState.params.docId))}
            />
            <Route path="login" component={NoMatch} />
            <Route path="/sitemap" component={NavigationTree} />
            <Route path="*" component={NoMatch} />
        </Route>
    )
}
