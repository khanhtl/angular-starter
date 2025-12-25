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

    { path: '', redirectTo: 'button', pathMatch: 'full' },
];
