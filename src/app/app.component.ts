import { produce } from 'immer';
import { QuantityCellRendererComponent } from './quantity-cell-renderer/quantity-cell-renderer.component';
import {
  AddRowAction, DeleteRowAction, UpdateRows, UpdateRow,
  ToggleRowEditable, ToggleControls, DeleteBatchRows, IncreasePrice, ToggleDisableRows
} from './grid-store/actions/grid.actions';
import { Component, } from '@angular/core';
import { Store } from '@ngrx/store';

import 'ag-grid-enterprise';

import { Observable, interval } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { EditableCellRendererComponent } from './editable-cell-renderer/editable-cell-renderer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private store: Store<any>) {

    this.rowData$ = this.store.select(store => store.grid.rowData);
    this.enableControls$ = this.store.select(store => store.grid.enableControls);
    this.rowData$.subscribe((data) => {
      this.rowData = data.map(row => {
        return {
          ...row
        };
      });
    });


    this.enableControls$.subscribe(isEnabled => {
      if (isEnabled) {
        this.columnDefs = this.processColumnDefs(this.columnDefsWithControls);
      } else {
        this.columnDefs = this.processColumnDefs(this.columnDefsNormal);
      }
    });


  }
  rowData$: Observable<any>;
  enableControls$: Observable<any>;
  groupByCategory = true;
  columnDefs: any = [];
  defaultColDef: any = {
    valueSetter: (params) => {
      let newVal = params.newValue;

      const isNaN = +params.newValue !== +params.newValue;

      if (typeof (+params.newValue) === 'number' && !isNaN) {
        newVal = +params.newValue;
      }

      const colId = params.colDef.colId;
      const nodeId = params.node.id;
      this.store.dispatch(new UpdateRow(nodeId, colId, newVal));
      return false;
    },
    resizable: true,
    cellStyle: {
      display: 'flex',
      'align-items': 'center'
    }
  };
  autoGroupColumnDef = {
    headerName: 'Category'
  };
  gridApi: any;
  columnApi: any;
  rowData = [];
  quickFilterValue = '';


  // admin mode column defitnitions
  columnDefsWithControls: any = [
    {
      checkboxSelection: true,
      colId: 'editable',
      headerName: 'actions',
      cellRenderer: 'editableCellRendererComponent',
      cellRendererParams: {
        toggleEditable: this.onToggleEditable.bind(this),
        deleteRow: this.onDeleteRow.bind(this)
      },
      field: 'editable',
      cellStyle: { overflow: 'hidden' }
    },
    {
      colId: 'imgUrl',
      editable: this.editable,
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
      valueFormatter: this.currencyFormatter,
      editable: this.editable,
    },
    {
      colId: 'quantity',
      headerName: 'quantity',
      field: 'quantity',
      editable: this.editable,
    },
    {
      colId: 'category',
      headerName: 'category',
      field: 'category',
      enableRowGroup: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['drink', 'starter', 'main', 'desert'] },
      editable: this.editable,
      rowGroup: this.groupByCategory
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
      editable: this.editable,
    },

    {
      colId: 'total',
      headerName: 'total',
      aggFunc: 'sum',
      valueFormatter: this.currencyFormatter,
      valueGetter: (params) => {
        if (!params.node.group) { return params.data.quantity * params.data.price; }
        return params.value;
      }
    },
  ];

  // custumer mode column defitnitions
  columnDefsNormal: any = [
    {
      colId: 'imgUrl',
      editable: this.editable,
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
      valueFormatter: this.currencyFormatter,
      editable: this.editable,
    },

    {
      colId: 'quantity',
      headerName: 'quantity',
      field: 'quantity',
      editable: this.editable,
    },
    {
      colId: 'category',
      headerName: 'category',
      field: 'category',
      enableRowGroup: true,
      hide: true,
      rowGroup: this.groupByCategory
    },
    {
      colId: 'editable',
      width: 250,

      headerName: 'actions',
      cellRenderer: 'editableCellRendererComponent',
      cellRendererParams: {
        toggleEditable: this.onToggleEditable.bind(this),
        deleteRow: this.onDeleteRow.bind(this)
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
      editable: this.editable,
    },



    {
      colId: 'total',
      headerName: 'total',
      aggFunc: 'sum',
      valueFormatter: this.currencyFormatter,
      valueGetter: (params) => {
        if (!params.node.group) { return params.data.quantity * params.data.price; }
        return params.value;
      }
    },
  ];

  frameworkComponents: any = {
    editableCellRendererComponent: EditableCellRendererComponent,
    quantityCellRendererComponent: QuantityCellRendererComponent
  };



  // GRID CALLBACKS

  getRowHeight(params) {
    if (params.node.group) { return 50; }
    return 100;
  }

  editable(params) {
    if (!params.node.group) {
      return params.node.data.editable;
    }
    return false;
  }


  currencyFormatter(params) {
    if (!params.node.group) { return `$${params.value}`; }
    return params.value;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.columnApi.autoSizeAllColumns();
  }


  getRowNodeId(data) {
    return data.id;
  }

  getRowStyle(params) {
    if (!params.node.group) {
      if (!params.node.data.editable) {
        return {
          background: 'rgba(111,111,111,0.12)',
        };
      }

      return {
        background: 'white',
      };
    }
  }

  // LIFECYCLE METHODS



  // LOCAL STATE CHANGE
  onGroup() {
    this.groupByCategory = !this.groupByCategory;

    const newCols = produce(this.columnDefs, draft => {
      const categoryCol = draft.find(col => col.colId === 'category');
      categoryCol.rowGroup = this.groupByCategory;
    });

    this.gridApi.setColumnDefs(newCols);
  }

  onQuickFilterInput(e) {
    this.gridApi.setQuickFilter(e.target.value);
  }

  // ACTIONS
  onAddRow() {
    this.store.dispatch(new AddRowAction({
      id: uuid(),
      name: 'product',
      quantity: 0,
      price: 0,
      editable: true,
      imgUrl: `../../../assets/images/placeholder.png`
    }));
  }

  onToggleDisableSelectedRows() {
    const nodeIds = this.gridApi.getSelectedNodes().map(node => node.id);
    this.store.dispatch(new ToggleDisableRows(nodeIds));
  }


  onIncreasePrice() {
    this.store.dispatch(new IncreasePrice(10));
  }

  onDeleteRow(nodeId) {
    this.store.dispatch(new DeleteRowAction(nodeId));
  }

  onToggleEditable(nodeId) {
    this.store.dispatch(new ToggleRowEditable(nodeId));
  }


  onToggleControls() {
    this.store.dispatch(new ToggleControls());
  }

  onDeleteSelected() {
    const nodeIds = this.gridApi.getSelectedNodes().map(node => node.id);
    this.store.dispatch(new DeleteBatchRows(nodeIds));
  }



  // HELPERS
  // adds rowGroup true or false to the category column
  processColumnDefs(columnDefs) {
    const cols = produce(columnDefs, draftCols => {
      const categoryCol = draftCols.find(col => col.colId === 'category');
      categoryCol.rowGroup = this.groupByCategory;
    });

    return cols;
  }
}
