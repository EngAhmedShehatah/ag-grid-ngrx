import { GridActionTypes } from './../actions/grid.actions';
import { v4 as uuid } from 'uuid';

import produce from 'immer';

const initialState = {

    columnDefs: [],
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
    groupByCategory: false,
};


export function GridReducer(state = initialState, action) {
    switch (action.type) {
        case GridActionTypes.TOGGLE_GROUP_BY_CATEGORY: return toggleGrouppByCategory(state, action);

        case GridActionTypes.LOAD_ADMIN_COLUMN_DEFS: return loadAdminColumnDefs(state, action);
        case GridActionTypes.LOAD_CUSTUMER_COLUMN_DEFS: return loadCustumerAdminColumnDefs(state, action);
        case GridActionTypes.ADD_ROW: return addRow(state, action);
        case GridActionTypes.DELETE_ROW: return deleteRow(state, action);
        case GridActionTypes.DELETE_BATCH_ROWS: return deleteBatchRows(state, action);
        case GridActionTypes.UPDATE_ROW: return updateRow(state, action);
        case GridActionTypes.TOGGLE_ROW_EDITABLE: return toggleRowsEditable(state, action);
        case GridActionTypes.TOGGLE_CONTROLS: return toggleControls(state, action);
        case GridActionTypes.INCREASE_PRICE: return increasePrice(state, action);
        case GridActionTypes.TOGGLE_DISABLE_ROWS: return toggleDisableRows(state, action);
        default:
            return state;
    }
}



function toggleGrouppByCategory(state, action) {

    console.log('raan');
    return produce(state, draftState => {

        const toggledGroup: boolean = !draftState.groupByCategory;

        const categoryCol = draftState.columnDefs.find(colDef => colDef.colId === 'category');
        categoryCol.rowGroup = toggledGroup;
        draftState.groupCyCategory = toggledGroup;
    });

}



function loadAdminColumnDefs(state, action) {
    const component = action.payload;
    return {
        ...state,
        columnDefs: ADMIN_COLS(component)
    };
}

function loadCustumerAdminColumnDefs(state, action) {
    const component = action.payload;
    return {
        ...state,
        columnDefs: CUSTUMER_COLS(component)
    };
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




function updateRow(state, action) {
    return produce(state, draftState => {
        const indx = draftState.rowData.findIndex((data) => data.id === action.nodeId);
        draftState.rowData[indx][action.colId] = action.value;
    });
}

function toggleRowsEditable(state, action) {
    return produce(state, draftState => {
        const indx = state.rowData.findIndex((data) => data.id === action.payload);
        draftState.rowData[indx] = { ...draftState.rowData[indx], editable: !draftState.rowData[indx].editable };
    });
}

function toggleControls(state, action) {
    return {
        ...state,
        enableControls: !state.enableControls
    };

}


function increasePrice(state, action) {
    const percentage = action.payload;
    return produce(state, draftState => {
        draftState.rowData.forEach(row => row.price =
            +Number(row.price + row.price * percentage / 100).toFixed(2)
        );
    });
}


function toggleDisableRows(state, action) {
    const ids: any = action.payload;

    if (ids.length === 0) {
        return state;
    }

    return produce(state, draftState => {
        const rowsToToggle = draftState.rowData.filter(row => ids.includes(row.id));
        const enable = !rowsToToggle[0].editable;

        rowsToToggle.forEach(row => {
            row.editable = enable;
        });
    });

}




function ADMIN_COLS(comp) {
    return [
        {
            checkboxSelection: true,
            colId: 'editable',
            headerName: 'actions',
            cellRenderer: 'editableCellRendererComponent',
            cellRendererParams: {
                toggleEditable: comp.onToggleEditable.bind(comp),
                deleteRow: comp.onDeleteRow.bind(comp)
            },
            field: 'editable',
            cellStyle: { overflow: 'hidden' }
        },
        {
            colId: 'imgUrl',
            editable: comp.editable,
            field: 'imgUrl',
            headerName: 'picture',
            cellStyle: {
                'white-space': 'normal !important'
            },
            cellRenderer: (params) => {
                if (!params.node.group) { return `<img  style="width: auto; height: 100%" src="${params.data.imgUrl}"/>`; }
                return params.value;
            }
        },
        {
            colId: 'price',
            headerName: 'price',
            field: 'price',
            valueFormatter: comp.currencyFormatter,
            editable: comp.editable,
        },
        {
            colId: 'quantity',
            headerName: 'quantity',
            field: 'quantity',
            editable: comp.editable,
        },
        {
            colId: 'category',
            headerName: 'category',
            field: 'category',
            enableRowGroup: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['drink', 'starter', 'main', 'desert'] },
            editable: comp.editable,
            rowGroup: comp.groupByCategory
        },
        {
            colId: 'id',
            headerName: 'id',
            field: 'id',
            hide: true,
        },
        {
            colId: 'name',
            headerName: 'name',
            field: 'name',
            editable: comp.editable,
        },

        {
            colId: 'total',
            headerName: 'total',
            aggFunc: 'sum',
            valueFormatter: comp.currencyFormatter,
            valueGetter: (params) => {
                if (!params.node.group) { return params.data.quantity * params.data.price; }
                return params.value;
            }
        },
    ];
}


function CUSTUMER_COLS(comp) {
    return [{
        colId: 'imgUrl',
        editable: comp.editable,
        field: 'imgUrl',
        headerName: 'picture',
        cellStyle: {
            'white-space': 'normal !important'
        },
        cellRenderer: (params) => {
            if (!params.node.group) { return `<img  style="width: auto; height: 100%" src="${params.data.imgUrl}"/>`; }
            return params.value;
        }
    },
    {
        colId: 'price',
        headerName: 'price',
        field: 'price',
        valueFormatter: comp.currencyFormatter,
        editable: comp.editable,
    },

    {
        colId: 'quantity',
        headerName: 'quantity',
        field: 'quantity',
        editable: comp.editable,
    },
    {
        colId: 'category',
        headerName: 'category',
        field: 'category',
        enableRowGroup: true,
        hide: true,
        rowGroup: comp.groupByCategory
    },
    {
        colId: 'editable',
        width: 250,

        headerName: 'actions',
        cellRenderer: 'editableCellRendererComponent',
        cellRendererParams: {
            toggleEditable: comp.onToggleEditable.bind(comp),
            deleteRow: comp.onDeleteRow.bind(comp)
        },
        field: 'editable',
        hide: true,
    },
    {
        colId: 'id',
        headerName: 'id',
        field: 'id',
        hide: true,
    },
    {
        colId: 'name',
        headerName: 'name',
        field: 'name',
        editable: comp.editable,
    },
    {
        colId: 'total',
        headerName: 'total',
        aggFunc: 'sum',
        valueFormatter: comp.currencyFormatter,
        valueGetter: (params) => {
            if (!params.node.group) { return params.data.quantity * params.data.price; }
            return params.value;
        }
    },
    ];
}
