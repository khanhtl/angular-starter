import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[itemTemplate]',
  standalone: true
})
export class ItemTemplateDirective {
  @Input('itemTemplate') name: string = '';
  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: 'ng-template[tagTemplate]',
  standalone: true
})
export class TagTemplateDirective {
  @Input('tagTemplate') name: string = '';
  constructor(public template: TemplateRef<any>) {}
}
