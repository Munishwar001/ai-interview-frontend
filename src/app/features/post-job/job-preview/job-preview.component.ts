import { Component, OnInit,Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';
@Component({
  selector: 'app-job-preview',
  standalone: true,
  imports:[CommonModule,Icons],
  templateUrl: './job-preview.component.html',
  styleUrls: ['./job-preview.component.css']
})
export class JobPreviewComponent implements OnInit {
@Input()jobdata:any=null;
@Input()selectedSkills:any[]=[];
isOpen=false;
open(){
  this.isOpen=true;
}
close(){
  this.isOpen=false;
}
  constructor() { }

  ngOnInit() {
  }

}
