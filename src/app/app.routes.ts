import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'button',
        loadComponent: () => import('./pages/button-demo/button-demo.component').then(m => m.ButtonDemoComponent)
    },
    {
        path: 'grid',
        loadComponent: () => import('./pages/grid-demo/grid-demo.component').then(m => m.GridDemoComponent)
    },
    {
        path: 'input',
        loadComponent: () => import('./pages/input-demo/input-demo.component').then(m => m.InputDemoComponent)
    },
    {
        path: 'candidates',
        loadChildren: () =>
            import('@angular-starter/feature/candidate')
                .then(m => m.candidateRoutes),
    },
    {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar-demo/calendar-demo.component').then(m => m.CalendarDemoComponent)
    },
    {
        path: 'date-box',
        loadComponent: () => import('./pages/date-box-demo/date-box-demo.component').then(m => m.DateBoxDemoComponent)
    },
    {
        path: 'date-range',
        loadComponent: () => import('./pages/date-range-demo/date-range-demo.component').then(m => m.DateRangeDemoComponent)
    },
    {
        path: 'select-box',
        loadComponent: () => import('./pages/select-box-demo/select-box-demo.component').then(m => m.SelectBoxDemoComponent)
    },
    {
        path: 'tag-box',
        loadComponent: () => import('./pages/tag-box-demo/tag-box-demo.component').then(m => m.TagBoxDemoComponent)
    },
    {
        path: 'check-box',
        loadComponent: () => import('./pages/check-box-demo/check-box-demo.component').then(m => m.CheckBoxDemoComponent)
    },
    {
        path: 'radio-group',
        loadComponent: () => import('./pages/radio-group-demo/radio-group-demo.component').then(m => m.RadioGroupDemoComponent)
    },
    {
        path: 'tab',
        loadComponent: () => import('./pages/tab-demo/tab-demo.component').then(m => m.TabDemoComponent)
    },
    {
        path: 'textarea',
        loadComponent: () => import('./pages/textarea-demo/textarea-demo.component').then(m => m.TextareaDemoComponent)
    },
    {
        path: 'carousel',
        loadComponent: () => import('./pages/carousel-demo/carousel-demo.component').then(m => m.CarouselDemoComponent)
    },
    {
        path: 'pagination',
        loadComponent: () => import('./pages/pagination-demo/pagination-demo.component').then(m => m.PaginationDemoComponent)
    },
    {
        path: 'popover',
        loadComponent: () => import('./pages/popover-demo/popover-demo.component').then(m => m.PopoverDemoComponent)
    },
    {
        path: 'toast',
        loadComponent: () => import('./pages/toast-demo/toast-demo.component').then(m => m.ToastDemoComponent)
    },
    {
        path: 'skeleton',
        loadComponent: () => import('./pages/skeleton-demo/skeleton-demo.component').then(m => m.SkeletonDemoComponent)
    },
    {
        path: 'spinner',
        loadComponent: () => import('./pages/spinner-demo/spinner-demo.component').then(m => m.SpinnerDemoComponent)
    },

    { path: '', redirectTo: 'button', pathMatch: 'full' },
];
