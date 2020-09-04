import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-editable-cell-renderer',
  template: `

<div class="actions-container" >

  <div  *ngIf="!isGroupNode">
    <button
    mat-stroked-button
     (click)="onToggleEditable($event)">
     {{buttonEditableText}}
    </button>



    <button
      type="button"
      color="primary"
      mat-stroked-button
      color="warn"
      (click)="onDeleteRow($event)"
      >
      Delete
    </button>
  <div>
</div>


  `,
  styleUrls: ['./editable-cell-renderer.component.scss']
})
export class EditableCellRendererComponent implements OnInit {
  params: any;
  buttonEditableText;
  isGroupNode: boolean;

  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.isGroupNode = params.node.group;
    if (!this.isGroupNode) { this.buttonEditableText = params.node.data.editable === true ? 'disable' : 'enable'; }
  }

  ngOnInit() {
  }

  onToggleEditable() {
    this.params.toggleEditable(this.params.node.data.id);
  }

  onDeleteRow() {
    this.params.deleteRow(this.params.node.data.id);
  }
}
