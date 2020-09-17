import { produce } from 'immer';
import { QuantityCellRendererComponent } from './quantity-cell-renderer/quantity-cell-renderer.component';
import {
  AddRowAction,
  DeleteRowAction,
  UpdateRow,
  ToggleRowEditable,
  ToggleControls,
  DeleteBatchRows,
  IncreasePrice,
  ToggleDisableRows,
  LoadAdminColumnDefs,
  LoadCustumerColumnDefs, ToggleGroupByCategory
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

    this.loadAdminColumnDefs();


    this.rowData$ = this.store.select(store => store.grid.rowData);
    this.columnDefs$ = this.store.select(store => store.grid.columnDefs);


    this.enableControls$ = this.store.select(store => store.grid.enableControls);
    this.enableControls$.subscribe(isEnabled => {
      if (isEnabled) {
        this.loadAdminColumnDefs();
      } else {
        this.loadCustumerColumnDefs();
      }
    });
  }


  rowData$: Observable<any>;
  columnDefs$: Observable<any>;
  enableControls$: Observable<any>;
  gridApi: any;
  columnApi: any;
  quickFilterValue = '';
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
    headerName: 'Category',
  };

  frameworkComponents: any = {
    editableCellRendererComponent: EditableCellRendererComponent,
    quantityCellRendererComponent: QuantityCellRendererComponent
  };




  loadAdminColumnDefs() {
    this.store.dispatch(new LoadAdminColumnDefs(this));
  }


  loadCustumerColumnDefs() {
    this.store.dispatch(new LoadCustumerColumnDefs(this));
  }


  // GRID CALLBACKS

  getRowHeight(params) {
    if (params.node.group) { return 50; }
    return 100;
  }

  editable(params): boolean {
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

  onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
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



  // LOCAL STATE CHANGE


  onQuickFilterInput(e) {
    this.gridApi.setQuickFilter(e.target.value);
  }

  // ACTIONS

  onGroup() {
    this.store.dispatch(new ToggleGroupByCategory());
  }

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

}
