import axios from 'axios';

// IMPORTANT GENERIC METHODS TO HANDLE LAYOUTS, DATA, COMMITS

export function initLayout(
    entity, docType, tabId, subentity = null, docId = null, isAdvanced, list,
    supportTree
) {
    return () => axios.get(
        config.API_URL +
        '/' + entity + '/' + docType +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (subentity ? '/' + subentity : '') +
        '/layout' +
        (isAdvanced ? '?advanced=true' : '') +
        (list ? '?viewType=' + list : '') +
        (supportTree ? '&supportTree=true' : '')
    );
}

export function getData(
    entity, docType, docId, tabId, rowId, subentity, subentityId, isAdvanced
) {
    return () => axios.get(
        config.API_URL +
        '/' + entity +
        '/' + docType +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (rowId ? '/' + rowId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        (isAdvanced ? '?advanced=true' : '')
    );
}

export function createInstance(entity, docType, docId, tabId, subentity) {
    return () => axios.post(
        config.API_URL +
        '/' + entity +
        '/' + docType +
        '/' + docId +
        (tabId ? '/' + tabId : '') +
        (subentity ? '/' + subentity : '')
    );
}

export function patchRequest(
    entity, docType, docId = 'NEW', tabId, rowId, property, value, subentity,
    subentityId, isAdvanced, viewId
) {

    let payload = [];

    if (docId === 'NEW') {
        payload = [];
    } else if (Array.isArray(property) && value !== undefined) {
        property.map(item => {
            payload.push({
                'op': 'replace',
                'path': item.field,
                'value': value
            });
        });
    } else if(property && value !== undefined) {
        payload = [{
                'op': 'replace',
                'path': property,
                'value': value
            }];
    } else {
        payload = [];
    }

    return () => axios.patch(
        config.API_URL +
        '/' + entity +
        (docType ? '/' + docType : '') +
        (viewId ? '/' + viewId : '') +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (rowId ? '/' + rowId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        (isAdvanced ? '?advanced=true' : ''), payload);
}

export function getDataByIds(entity, docType, viewId, docIds) {
    return () => axios.get(
        config.API_URL +
        '/' + entity +
        (docType ? '/' + docType : '') +
        (viewId ? '/' + viewId : '') +
        '/byIds' +
        '?ids='+ docIds
    )
}

export function completeRequest(
    entity, docType, docId, tabId, rowId, subentity, subentityId
) {
    return () => axios.post(
        config.API_URL +
        '/' + entity + '/' +
        (docType ? '/' + docType : '') +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (rowId ? '/' + rowId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        '/complete'
    );
}

export function autocompleteRequest(
    docType, propertyName, query, docId, tabId, rowId, entity, subentity,
    subentityId, viewId
) {
    console.log(entity);
    return () => axios.get(
        config.API_URL +
        '/' + entity +
        (docType ? '/' + docType : '') +
        (viewId ? '/' + viewId : '') +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (rowId ? '/' + rowId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        '/attribute/' + propertyName +
        '/typeahead' + '?query=' + encodeURIComponent(query)
    );
}

export function dropdownRequest(
    docType, propertyName, docId, tabId, rowId, entity, subentity, subentityId,
    viewId
) {
    return () => axios.get(
        config.API_URL +
        '/' + entity +
        (docType ? '/' + docType : '') +
        (viewId ? '/' + viewId : '') +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (rowId ? '/' + rowId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        '/attribute/' + propertyName +
        '/dropdown'
    );
}

export function deleteRequest(
    entity, docType, docId, tabId, ids, subentity, subentityId
) {
    return () => axios.delete(
        config.API_URL +
        '/' + entity +
        (docType ? '/' + docType : '') +
        (docId ? '/' + docId : '') +
        (tabId ? '/' + tabId : '') +
        (subentity ? '/' + subentity : '') +
        (subentityId ? '/' + subentityId : '') +
        (ids ? '?ids=' + ids : '')
    );
}

export function actionsRequest(entity, type, id, selected){
    let query = '';
    for (let item of selected) {
       query+=','+item;
    }
    query = query.substring(1);

    return () => axios.get(
        config.API_URL + '/' +
        entity + '/' +
        type + '/' +
        id +
        '/actions'+
        (selected.length > 0 && entity=='documentView' ?
            '?selectedIds='+ query :'')
    );
}

export function referencesRequest(entity, type, id){
    return () => axios.get(
        config.API_URL + '/' +
        entity + '/' +
        type + '/' +
        id +
        '/references'
    );
}

export function attachmentsRequest(entity, docType, docId) {
    return () => axios.get(
        config.API_URL + '/' +
        entity + '/' +
        docType + '/' +
        docId +
        '/attachments'
    );
}

export function processNewRecord(entity, docType, docId) {
    return () => axios.get(
        config.API_URL + '/' +
        entity + '/' +
        docType + '/' +
        docId +
        '/processNewRecord'
    );
}

export function openFile(entity, docType, docId, fileType, fileId) {
    return () => {
        const url =
            config.API_URL + '/' +
            entity + '/' +
            docType + '/' +
            docId + '/' +
            fileType + '/' +
            fileId;

        window.open(url, '_blank');
    }
}
