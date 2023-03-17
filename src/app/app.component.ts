import { Component } from '@angular/core'
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TDocumentDefinitions, Column } from 'pdfmake/interfaces';
import { UiService } from './services/ui.service';
import { Subscription } from 'rxjs';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

class Product {
  name!: string;
  price!: number;
  qty!: number;
}

class Invoice {
  customerName!: string;
  address!: string;
  contactNo!: number;
  email!: string;

  products: Product[] = [];
  additionalDetails!: string;

  constructor() {
    // Initially one empty product row    
    this.products.push(new Product());
  }
}

declare module "pdfmake/interfaces" {
  interface Style {
    decorationColor?: string;
    decorationStyle?: DecorationStyle;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  invoice = new Invoice();
  showAddTask!: boolean;
  subscription: Subscription;

  constructor(private uiService: UiService) {
    this.subscription = this.uiService.onToggle().subscribe
    (value => this.showAddTask = value)
  }

  generatePDF(action = 'open') {

    let docDefinition: TDocumentDefinitions = {
      content: [
        
        {
          text: 'INVOICE',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue'
        },
        // add columns
        {
          columns: [
            [
              {
                text: this.invoice.customerName,
                bold: true
              },
              { text: this.invoice.address },
              { text: this.invoice.email },
              { text: this.invoice.contactNo }
            ],
            [
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              {
                text: `Invoice No : ${((Math.random() * 1000).toFixed(0))}`,
                alignment: 'right'
              }
            ]
          ] as Column[]
        },
        // add table
        {
          text: 'Order Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Item', 'Quantity', 'Price per unit', 'Amount'],
              ...this.invoice.products.map(p => ([p.name, p.price, p.qty, (p.price * p.qty).toFixed(2)])),
              [{ text: 'Total Amount', colSpan: 3 }, {}, {}, this.invoice.products.reduce((sum, p) => sum + (p.qty * p.price), 0).toFixed(2)]
            ]
          }
        },
        // add qr code together with signature
        {  
          columns: [  
            [{ qr: `${this.invoice.customerName}`, fit: '50' }],  
            [{ text: 'Signature', alignment: 'right', italics: true }],  
          ] as Column[]  
        }, 
        // terms to be observed
        {  
          ul: [  
            'Terms and Conditions',   
            'This is system generated invoice.',  
          ],  
        }  
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15],
          decorationColor: '#047886',
          decorationStyle: 'solid'
        }
      }
    };

    if (action === 'download') {
      pdfMake.createPdf(docDefinition).download();
    } else if (action === 'print') {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  }

  addProduct() {
    this.invoice.products.push(new Product());
  }
}     