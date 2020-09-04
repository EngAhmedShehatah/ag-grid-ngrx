import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AgGridModule } from 'ag-grid-angular';
import { GridReducer } from './grid-store/reducers/grid.reducer';
import { EditableCellRendererComponent } from './editable-cell-renderer/editable-cell-renderer.component';
import { QuantityCellRendererComponent } from './quantity-cell-renderer/quantity-cell-renderer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    EditableCellRendererComponent,
    QuantityCellRendererComponent,
  ],
  imports: [
    AgGridModule.withComponents([EditableCellRendererComponent, QuantityCellRendererComponent, ]),
    BrowserModule,
    FormsModule,
    StoreModule.forRoot({
      grid: GridReducer
    }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    BrowserAnimationsModule,
    MatButtonModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
