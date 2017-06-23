import axios from 'axios';

export function getView(boardId, viewId, firstRow) {
    return axios.get(
        config.API_URL +
        '/board/' + boardId +
        '/newCardsView' +
        (viewId ? '/' + viewId : '') +
        (viewId ? '?firstRow=' + firstRow + '&pageLength=50' : '')
    );
}

export function addCard(boardId, laneId, cardId, index) {
    return axios.post(
        config.API_URL +
        '/board/' + boardId +
        '/card', {
            'laneId': laneId,
            'position': index,
            'documentId': cardId
        }
    );
}

export function filterCards(boardId, viewId) {
    return axios.post(
        config.API_URL +
        '/board/' + boardId +
        '/newVardsView/' + viewId +
        '/filter'
    );
}

export function addDashboardWidget(entity, id) {
    return axios.post(
        config.API_URL +
        '/dashboard/' + entity + '/new', {
            'kpiId': id
        }
    );
}

export function removeDashboardWidget(entity, id) {
    return axios.delete(config.API_URL + '/dashboard/' + entity + '/' + id);
}
