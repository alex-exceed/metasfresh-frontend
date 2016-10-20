import * as types from '../constants/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    filters: [],
    sorting: {
        prop: null,
        dir: null,
        windowType: null
    },
    page: 1
}

export default function listHandler(state = initialState, action) {
    switch(action.type){
        case types.SET_LIST_FILTERS:
            return update(state, {
                filters: {$push: [action.filter]}
            })
        case types.SET_LIST_PAGINATION:
            return Object.assign({}, state, {
                page: action.page,
                windowType: action.windowType
            })
        case types.SET_LIST_SORTING:
            return Object.assign({}, state, {
                sorting: Object.assign({}, state.sorting, {
                    prop: action.prop,
                    dir: action.dir,
                    windowType: action.windowType
                })
            })
        case types.CLEAR_LIST_PROPS:
            return Object.assign({}, state, {
                filters: [],
                page: 1,
                sorting: {},
                windowType: null
            })
        default:
            return state
    }
}
