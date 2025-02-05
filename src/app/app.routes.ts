import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { LayoutComponent } from './page/layout/layout.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { DeviceComponent } from './page/device/device.component';
import { ReportComponent } from './page/report/report.component';
// import { UpdateDeviceComponent } from './page/update-device/update-device.component';
import { ForgotPasswordComponent } from './page/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './page/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:uidb64/:token', component: ResetPasswordComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'device',
                component: DeviceComponent
            },
            {
                path: 'report',
                component: ReportComponent
            },
            // {
            //     path: 'update_device/:id',
            //     component : UpdateDeviceComponent
            // },
            // {
            //     path : 'update-register/:id',
            //     component: UpdateRegisterComponent
            // }
        ]
    }
];
