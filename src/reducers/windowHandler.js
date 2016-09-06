import * as types from '../constants/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    connectionError: false,
    modal: {
        visible: false,
        type: 0,
        tabId: null,
        rowId: null,
        layout: {},
        data: [],
        rowData: {}
    },
    master: {
        layout: {},
        data: [],
        rowData: {},
    },
    indicator: 'saved'
}

export default function windowHandler(state = initialState, action) {
    switch(action.type){

        case types.NO_CONNECTION:
            return Object.assign({}, state, {
                connectionError: action.status
        })

        case types.OPEN_MODAL:
            return Object.assign({}, state, {
                modal: Object.assign({}, state.modal, {
                    visible: true,
                    type: action.windowType,
                    tabId: action.tabId,
                    rowId: action.rowId
                })
        })

        case types.CLOSE_MODAL:
            return Object.assign({}, state, {
                modal: Object.assign({}, state.modal, {
                    visible: false,
                    tabId: null,
                    rowId: null,
                    layout: {},
                    data: [],
                    rowData: {}
                })
        })

        // SCOPED ACTIONS

        case types.INIT_LAYOUT_SUCCESS:
            return Object.assign({}, state, {
                [action.scope]: Object.assign({}, state[action.scope], {
                    layout: action.layout
                })
        })

        case types.INIT_DATA_SUCCESS:
            return Object.assign({}, state, {
                [action.scope]: Object.assign({}, state[action.scope], {
                    data: action.data,
                    rowData: {}
                })
        })

        case types.ADD_ROW_DATA:
            return Object.assign({}, state, {
                [action.scope]: Object.assign({}, state[action.scope], {
                    rowData: Object.assign({}, state[action.scope].rowData, action.data)
                })
        })

        case types.ADD_NEW_ROW:
            return update(state, {
                [action.scope]: {
                    rowData: {
                        [action.tabid]: {
                            [action.rowid]: {$set: action.item}
                        }
                    }
                }
            })

        case types.UPDATE_ROW_SUCCESS:
            return update(state, {
                [action.scope]: {
                    rowData: {
                        [action.tabid]: {
                            [action.rowid]: {
                                fields: {$set: state[action.scope].rowData[action.tabid][action.rowid].fields.map(item =>
                                    item.field === action.item.field ?
                                        Object.assign({},item,action.item) :
                                        item
                                )}
                            }
                        }
                    }
                }
            })

        case types.UPDATE_DATA_SUCCESS:
            return Object.assign({}, state, {
                [action.scope]: Object.assign({}, state[action.scope], {
                    data: state[action.scope].data.map(item =>
                        item.field === action.item.field ?
                            Object.assign({}, item, action.item) :
                            item
                    )
                })
        })

        case types.UPDATE_DATA_PROPERTY:
            return Object.assign({}, state, {
                [action.scope]: Object.assign({}, state[action.scope], {
                    data: state[action.scope].data.map(item =>
                        item.field === action.property ?
                        Object.assign({}, item, { value: action.value }) :
                        item
                    )
                })
        })

        case types.UPDATE_ROW_PROPERTY:
            return update(state, {
                [action.scope]: {
                    rowData: {
                        [action.tabid]: {
                            [action.rowid]: {
                                fields: {$set: state[action.scope].rowData[action.tabid][action.rowid].fields.map( item =>
                                    item.field === action.property ?
                                        Object.assign({}, item, {value: action.value}):
                                        item
                                )}
                            }
                        }
                    }
                }
            })

        // END OF SCOPED ACTIONS

        // INDICATOR ACTIONS
        case types.CHANGE_INDICATOR_STATE:
            return Object.assign({}, state, {
                indicator: action.state
            }
        );
        // END OF INDICATOR ACTIONS

        default:
            return state
    }
}
