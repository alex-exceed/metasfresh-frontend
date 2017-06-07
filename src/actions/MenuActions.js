import * as types from '../constants/MenuTypes'
import axios from 'axios';

// REQUESTS

export function pathRequest(nodeId) {
    return axios.get(
        config.API_URL +
        '/menu/' + nodeId +
        '/path/' +
        '&inclusive=true'
    );
}

export function nodePathsRequest(nodeId, limit) {
    return axios.get(
        config.API_URL +
        '/menu/node/' + nodeId +
        '?depth=2' +
        (limit ? '&childrenLimit=' + limit : '')
    );
}

export function elementPathRequest(pathType, elementId) {
    return axios.get(
        config.API_URL +
        '/menu/elementPath?type=' + pathType +
        '&elementId=' + elementId +
        '&inclusive=true'
    );
}

export function queryPathsRequest(query, limit, child) {
    return axios.get(
        config.API_URL +
        '/menu/queryPaths?nameQuery=' + query +
        (limit ? '&childrenLimit=' + limit : '') +
        (child ? '&childrenInclusive=true':'')
    );
}

export function rootRequest(limit, depth = 0, onlyFavourites) {
    return axios.get(
        config.API_URL +
        '/menu/root?depth=' + depth +
        (limit ? '&childrenLimit=' + limit : '') + 
        (onlyFavourites ? '&favourites=true' : '')
    );
}

// END OF REQUESTS

export function setBreadcrumb(breadcrumb){
    return {
        type: types.SET_BREADCRUMB,
        breadcrumb: breadcrumb
    }
}

export function getRootBreadcrumb() {
    return rootRequest(6, 10, true).then(root => ({
        nodeId: '0', children: root.data.children
    }));
}

export function getWindowBreadcrumb(id){
    return dispatch => {
        elementPathRequest('window', id).then(response => {
            let req = 0;
            let pathData = flattenOneLine(response.data);

            // promise to get all of the breadcrumb menu options
            let breadcrumbProcess = new Promise((resolve) => {

                for(let i = 0; i < pathData.length; i++){
                    const node = pathData[i];

                    nodePathsRequest(node.nodeId, 10).then(item => {
                        node.children = item.data;
                        req += 1;

                        if(req === pathData.length){
                            resolve(pathData);
                        }
                    })
                }
            });

            return breadcrumbProcess;
        }).then((item) => {
            dispatch(setBreadcrumb(item.reverse()));
        }).catch(() => {
            dispatch(setBreadcrumb([]));
        });
    }
}

//END OF THUNK ACTIONS

// UTILITIES

export function flattenLastElem(node, prop = 'children') {
    let result = [];

    if(node[prop]){
        node[prop].map(child => {
            const flat = flattenLastElem(child);

            if(typeof flat === 'object'){
                result = result.concat(flat);
            }else{
                result.push(flattenLastElem(child));
            }
        })
        return result;

    }else{
        return [node];
    }
}

export function flattenOneLine(node) {
    let result = [];
    if(node.children){
        flattenOneLine(node.children[0]).map(item => {
            result.push(
                item
            );
        })
    }
    result.push({
        nodeId: node.nodeId,
        caption: node.caption
    });
    return result;
}
