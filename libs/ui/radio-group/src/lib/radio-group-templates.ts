import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[itemTemplate]',
    standalone: true,
})
export class ItemTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
