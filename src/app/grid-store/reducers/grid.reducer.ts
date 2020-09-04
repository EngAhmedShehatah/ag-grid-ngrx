import { GridActionTypes } from './../actions/grid.actions';
import { v4 as uuid } from 'uuid';

import produce from 'immer';

const initialState = {
    rowData: [
        // tslint:disable: max-line-length
        { id: uuid(), name: 'Coffee', category: 'drink', editable: true, quantity: 1, price: 15, imgUrl: `../../../assets/images/coffee.png` },
        { id: uuid(), name: 'Tea', category: 'drink', editable: true, quantity: 1, price: 15, imgUrl: `../../../assets/images/tea.png` },
        { id: uuid(), name: 'Orange Juice', category: 'drink', editable: true, quantity: 1, price: 15, imgUrl: `../../../assets/images/oj.png` },
        { id: uuid(), name: 'Onion rings', category: 'starter', editable: false, quantity: 5, price: 2, imgUrl: `../../../assets/images/onion.png` },
        { id: uuid(), name: 'Chicken wings', category: 'starter', editable: false, quantity: 5, price: 2, imgUrl: `../../../assets/images/wings.png` },
        { id: uuid(), name: 'spring rolls', category: 'starter', editable: false, quantity: 5, price: 2, imgUrl: `../../../assets/images/spring.png` },
        { id: uuid(), name: 'Lasagna', category: 'main', editable: false, quantity: 10, price: 35, imgUrl: `../../../assets/images/lasagna.png` },
        { id: uuid(), name: 'Pasta', category: 'main', editable: false, quantity: 10, price: 1, imgUrl: `../../../assets/images/pasta.png` },
        { id: uuid(), name: 'Risotto', category: 'main', editable: false, quantity: 10, price: 35, imgUrl: `../../../assets/images/rissotto.png` },
        { id: uuid(), name: 'Cake', category: 'dessert', editable: false, quantity: 20, price: 23, imgUrl: `../../../assets/images/cake.png` },
        { id: uuid(), name: 'Ice cream', category: 'dessert', editable: false, quantity: 20, price: 23, imgUrl: `../../../assets/images/ice.png` },
        { id: uuid(), name: 'Cheese board', category: 'dessert', editable: false, quantity: 20, price: 23, imgUrl: `../../../assets/images/cheese.png` },
    ],
    enableControls: false,
};


export function GridReducer(state = initialState, action) {
    switch (action.type) {
        case GridActionTypes.ADD_ROW: return addRow(state, action);
        case GridActionTypes.DELETE_ROW: return deleteRow(state, action);
        case GridActionTypes.DELETE_BATCH_ROWS: return deleteBatchRows(state, action);
        case GridActionTypes.UPDATE_ROWS: return updateRows(state, action);
        case GridActionTypes.UPDATE_ROW: return updateRow(state, action);
        case GridActionTypes.TOGGLE_ROW_EDITABLE: return toggleRowsEditable(state, action);
        case GridActionTypes.TOGGLE_CONTROLS: return toggleControls(state, action);
        case GridActionTypes.INCREASE_PRICE: return increasePrice(state, action);
        case GridActionTypes.TOGGLE_DISABLE_ROWS: return toggleDisableRows(state, action);
        default:
            return state;
    }
}



function addRow(state, action) {
    return {
        ...state,
        rowData: [
            action.payload,
            ...state.rowData
        ]
    };
}

function deleteRow(state, action) {
    const nodeIdToRemove = action.payload;
    const filteredData = state.rowData.filter(node => node.id !== nodeIdToRemove);
    return {
        ...state,
        rowData: [
            ...filteredData
        ]
    };
}

function deleteBatchRows(state, action) {
    const nodeIdsToRemove: Array<any> = action.payload;
    const filteredData = state.rowData.filter((node) => {
        if (nodeIdsToRemove.includes(node.id)) { return false; }
        return true;
    });
    return {
        ...state,
        rowData: [
            ...filteredData
        ]
    };
}

function updateRows(state, action) {
    const updatedRowData = state.rowData.slice().map(row => {
        return {
            ...row,
            quantity: row.quantity !== undefined ? row.quantity + 10 : 1
        };
    });

    return {
        ...state,
        rowData: updatedRowData
    };
}


function updateRow(state, action) {
    const nextState = produce(state, draftState => {
        const indx = draftState.rowData.findIndex((data) => data.id === action.nodeId);
        draftState.rowData[indx][action.colId] = action.value;
    });
    return nextState;
}

function toggleRowsEditable(state, action) {
    const nextState = produce(state, draftState => {
        const indx = state.rowData.findIndex((data) => data.id === action.payload);
        draftState.rowData[indx] = { ...draftState.rowData[indx], editable: !draftState.rowData[indx].editable };
    });
    return nextState;
}

function toggleControls(state, action) {
    return {
        ...state,
        enableControls: !state.enableControls
    };

}


function increasePrice(state, action) {
    const percentage = action.payload;
    const nextState = produce(state, draftState => {
        draftState.rowData.forEach(row => row.price =
            +Number(row.price + row.price * percentage / 100).toFixed(2)
        );
    });
    return nextState;
}


function toggleDisableRows(state, action) {
    const ids: any = action.payload;

    if (ids.length === 0) {
        return state;
    }

    const nextState = produce(state, draftState => {
        const rowsToToggle = draftState.rowData.filter(row => ids.includes(row.id));
        const enable = !rowsToToggle[0].editable;

        rowsToToggle.forEach(row => {
            row.editable = enable;
        });
    });

    return nextState;
}


