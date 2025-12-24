import { ButtonComponent } from '@angular-starter/ui/button';
import { CellTemplateDirective, ColumnConfig, DataGridComponent } from '@angular-starter/ui/data-grid';
import { Component, signal } from '@angular/core';
import { LucideAngularModule, Pencil } from 'lucide-angular';

@Component({
    selector: 'app-grid-demo',
    standalone: true,
    imports: [DataGridComponent, CellTemplateDirective, ButtonComponent, LucideAngularModule],
    templateUrl: './grid-demo.component.html',
})
export class GridDemoComponent {
    readonly Pencil = Pencil;
    columns = signal<ColumnConfig[]>([
        { key: 'id', title: 'ID', width: '100px', align: 'center', pinned: 'left', pinnable: true },
        {
            key: 'personal',
            title: 'Personal Information',
            align: 'center',
            pinnable: true,
            children: [
                { key: 'name', title: 'Name', width: '150px' },
                { key: 'email', title: 'Email', width: '200px' },
                { key: 'phone', title: 'Phone', width: '150px' }
            ]
        },
        {
            key: 'work',
            title: 'Work Details',
            align: 'center',
            pinnable: true,
            children: [
                { key: 'department', title: 'Department', width: '150px' },
                { key: 'role', title: 'Role', width: '120px' },
                { key: 'salary', title: 'Salary', width: '120px', align: 'right' }
            ]
        },
        {
            key: 'employment',
            title: 'Employment',
            align: 'center',
            pinnable: true,
            children: [
                { key: 'startDate', title: 'Start Date', width: '120px' },
                { key: 'location', title: 'Location', width: '150px' },
                { key: 'manager', title: 'Manager', width: '150px' },
                { key: 'projects', title: 'Projects', width: '100px', align: 'center' }
            ]
        },
        { key: 'status', cellTemplate: 'cell-status', title: 'Status', width: '100px', align: 'center', pinned: 'right' },
        { key: 'actions', title: 'Actions', width: '120px', align: 'center', pinned: 'right', pinnable: false }
    ]);

    private generateSampleData() {
        const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
        const roles = ['Developer', 'Designer', 'Manager', 'Tester', 'Analyst', 'Consultant', 'Specialist'];
        const statuses = ['Active', 'Inactive', 'Pending', 'On Leave'];
        const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Toronto'];
        const firstNames = ['John John John JohnJohnJohnJohnJohn', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
        const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Davis', 'Miller', 'Garcia', 'Rodriguez', 'Lee'];

        return Array.from({ length: 50 }, (_, i) => {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

            return {
                id: i + 1,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                department: departments[Math.floor(Math.random() * departments.length)],
                role: roles[Math.floor(Math.random() * roles.length)],
                salary: `$${(Math.floor(Math.random() * 100) + 50) * 1000}`,
                startDate: new Date(
                    2020 + Math.floor(Math.random() * 4),
                    Math.floor(Math.random() * 12),
                    Math.floor(Math.random() * 28) + 1
                ).toLocaleDateString(),
                location: locations[Math.floor(Math.random() * locations.length)],
                manager: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                projects: Math.floor(Math.random() * 10) + 1,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                actions: 'Edit | Delete'
            };
        });
    }

    data = signal<Record<string, any>[]>(this.generateSampleData());
}
