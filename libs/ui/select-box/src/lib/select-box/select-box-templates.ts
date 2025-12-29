import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[itemTemplate]',
  standalone: true
})
export class ItemTemplateDirective {
  @Input('itemTemplate') name: string = '';
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: 'ng-template[fieldTemplate]',
  standalone: true
})
export class FieldTemplateDirective {
  @Input('fieldTemplate') name: string = '';
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: 'ng-template[groupTemplate]',
  standalone: true
})
export class GroupTemplateDirective {
  @Input('groupTemplate') name: string = '';
  constructor(public template: TemplateRef<any>) { }
}
