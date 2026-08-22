import {
  Component,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  ChartComponent,

  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  ApexPlotOptions

} from 'ng-apexcharts';

import {
  NzButtonModule
} from 'ng-zorro-antd/button';

import {
  NzCardModule
} from 'ng-zorro-antd/card';

import {
  NzTagModule
} from 'ng-zorro-antd/tag';

import {
  NzIconModule
} from 'ng-zorro-antd/icon';

import {
  NzSpinModule
} from 'ng-zorro-antd/spin';

import {
  AdminService
} from '../services/admin-service';


// ======================================================
// CHART TYPES
// ======================================================

type LineChartOptions = {

  series:
    ApexAxisChartSeries;

  chart:
    ApexChart;

  xaxis:
    ApexXAxis;

  stroke?:
    ApexStroke;

  dataLabels?:
    ApexDataLabels;

  grid?:
    ApexGrid;

  tooltip?:
    ApexTooltip;

};


type BarChartOptions = {

  series:
    ApexAxisChartSeries;

  chart:
    ApexChart;

  xaxis:
    ApexXAxis;

  plotOptions?:
    ApexPlotOptions;

  dataLabels?:
    ApexDataLabels;

  grid?:
    ApexGrid;

  tooltip?:
    ApexTooltip;

};


type DonutChartOptions = {

  series:
    number[];

  chart:
    ApexChart;

  labels:
    string[];

  legend?:
    ApexLegend;

  plotOptions?:
    ApexPlotOptions;

};


// ======================================================
// RECENT USER
// ======================================================

interface RecentUser {

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  plan:
    string;

  role:
    string;

  createdAt:
    string;

}


// ======================================================
// COMPONENT
// ======================================================

@Component({

  selector:
    'app-admin',

  standalone:
    true,

  imports: [

    CommonModule,

    RouterLink,

    ChartComponent,

    NzButtonModule,

    NzCardModule,

    NzTagModule,

    NzIconModule,

    NzSpinModule

  ],

  templateUrl:
    './admin.html',

  styleUrl:
    './admin.scss'

})
export class Admin
  implements OnInit {


  // ====================================================
  // SUMMARY CARDS
  // ====================================================

  totalUsers:
    number = 0;

  demoUsers:
    number = 0;

  proUsers:
    number = 0;

  activeUsers:
    number = 0;

  totalConversations:
    number = 0;

  totalMessages:
    number = 0;

  revenue:
    number = 0;

  conversionRate:
    number = 0;


  // ====================================================
  // RECENT USERS
  // ====================================================

  recentUsers:
    RecentUser[] = [];


  // ====================================================
  // UI STATE
  // ====================================================

  isLoading:
    boolean = true;

  hasError:
    boolean = false;


  // ====================================================
  // USERS CHART
  // ====================================================

  usersChart:
    LineChartOptions = {

      series: [],

      chart: {

        type:
          'line',

        height:
          300,

        toolbar: {

          show:
            false

        }

      },

      xaxis: {

        categories: []

      },

      stroke: {

        curve:
          'smooth',

        width:
          3

      },

      dataLabels: {

        enabled:
          false

      },

      grid: {

        strokeDashArray:
          4

      },

      tooltip: {

        shared:
          true

      }

    };


  // ====================================================
  // MESSAGES CHART
  // ====================================================

  messagesChart:
    LineChartOptions = {

      series: [],

      chart: {

        type:
          'area',

        height:
          300,

        toolbar: {

          show:
            false

        }

      },

      xaxis: {

        categories: []

      },

      stroke: {

        curve:
          'smooth',

        width:
          3

      },

      dataLabels: {

        enabled:
          false

      },

      grid: {

        strokeDashArray:
          4

      },

      tooltip: {

        shared:
          true

      }

    };


  // ====================================================
  // DEMO VS PRO
  // ====================================================

  planChart:
    DonutChartOptions = {

      series: [],

      chart: {

        type:
          'donut',

        height:
          300

      },

      labels: [

        'Demo',

        'Pro'

      ],

      legend: {

        position:
          'bottom'

      },

      plotOptions: {

        pie: {

          donut: {

            size:
              '65%',

            labels: {

              show:
                true,

              total: {

                show:
                  true,

                label:
                  'Users'

              }

            }

          }

        }

      }

    };


  // ====================================================
  // PRO CONVERSION CHART
  // ====================================================

  conversionChart:
    BarChartOptions = {

      series: [],

      chart: {

        type:
          'bar',

        height:
          300,

        toolbar: {

          show:
            false

        }

      },

      xaxis: {

        categories: []

      },

      plotOptions: {

        bar: {

          borderRadius:
            6,

          columnWidth:
            '45%'

        }

      },

      dataLabels: {

        enabled:
          false

      },

      grid: {

        strokeDashArray:
          4

      },

      tooltip: {

        shared:
          true

      }

    };


  // ====================================================
  // REVENUE CHART
  // ====================================================

  revenueChart:
    LineChartOptions = {

      series: [],

      chart: {

        type:
          'area',

        height:
          320,

        toolbar: {

          show:
            false

        }

      },

      xaxis: {

        categories: []

      },

      stroke: {

        curve:
          'smooth',

        width:
          3

      },

      dataLabels: {

        enabled:
          false

      },

      grid: {

        strokeDashArray:
          4

      },

      tooltip: {

        shared:
          true

      }

    };


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(

    private readonly adminService:
      AdminService,

    private readonly cdr:
      ChangeDetectorRef

  ) {}


  // ====================================================
  // ON INIT
  // ====================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  loadDashboard(): void {

    /*
     * Start loading.
     */

    this.isLoading =
      true;

    this.hasError =
      false;


    /*
     * Tell Angular immediately.
     */

    this.cdr.detectChanges();


    /*
     * Call all admin APIs together.
     */

    forkJoin({

      overview:
        this.adminService
          .getOverview(),

      users:
        this.adminService
          .getUsersPerDay(),

      messages:
        this.adminService
          .getMessagesPerDay(),

      conversions:
        this.adminService
          .getProConversions(),

      revenue:
        this.adminService
          .getRevenue(),

      recentUsers:
        this.adminService
          .getRecentUsers()

    })
    .subscribe({

      // ==============================================
      // SUCCESS
      // ==============================================

      next:
        (result) => {

          console.log(
            '✅ Admin dashboard API result:',
            result
          );


          /*
           * IMPORTANT:
           *
           * Stop loading BEFORE chart processing.
           *
           * This prevents the spinner from remaining
           * visible if something goes wrong while
           * building a chart.
           */

          this.isLoading =
            false;


          this.cdr.detectChanges();


          // ============================================
          // SUMMARY DATA
          // ============================================

          this.applyOverview(
            result.overview
          );


          // ============================================
          // CHARTS
          // ============================================

          try {

            this.createUsersChart(
              result.users
            );

          } catch (error) {

            console.error(
              'Users chart error:',
              error
            );

          }


          try {

            this.createMessagesChart(
              result.messages
            );

          } catch (error) {

            console.error(
              'Messages chart error:',
              error
            );

          }


          try {

            this.createConversionChart(
              result.conversions
            );

          } catch (error) {

            console.error(
              'Conversion chart error:',
              error
            );

          }


          try {

            this.createRevenueChart(
              result.revenue
            );

          } catch (error) {

            console.error(
              'Revenue chart error:',
              error

            );

          }


          // ============================================
          // RECENT USERS
          // ============================================

          this.recentUsers =
            Array.isArray(
              result.recentUsers
            )

              ? result.recentUsers

              : [];


          /*
           * Final Angular update.
           */

          this.cdr.detectChanges();

        },


      // ==============================================
      // ERROR
      // ==============================================

      error:
        (error) => {

          console.error(
            '❌ Admin dashboard API error:',
            error
          );


          this.isLoading =
            false;


          this.hasError =
            true;


          this.cdr.detectChanges();

        }

    });

  }


  // ====================================================
  // APPLY OVERVIEW DATA
  // ====================================================

  applyOverview(
    data: any
  ): void {

    console.log(
      '📊 Overview:',
      data
    );


    this.totalUsers =
      Number(
        data?.totalUsers || 0
      );


    this.demoUsers =
      Number(
        data?.demoUsers || 0
      );


    this.proUsers =
      Number(
        data?.proUsers || 0
      );


    this.activeUsers =
      Number(
        data?.activeUsers || 0
      );


    this.totalConversations =
      Number(
        data?.totalConversations || 0
      );


    this.totalMessages =
      Number(
        data?.totalMessages || 0
      );


    this.revenue =
      Number(
        data?.revenue || 0
      );


    /*
     * Calculate:
     *
     * Pro users / total users * 100
     */

    if (
      this.totalUsers > 0
    ) {

      this.conversionRate =

        (
          this.proUsers /
          this.totalUsers
        ) *
        100;

    } else {

      this.conversionRate =
        0;

    }


    /*
     * Update Demo / Pro donut.
     */

    this.planChart = {

      ...this.planChart,

      series: [

        this.demoUsers,

        this.proUsers

      ]

    };

  }


  // ====================================================
  // USERS PER DAY
  // ====================================================

  createUsersChart(
    data: any[]
  ): void {

    if (
      !Array.isArray(data)
    ) {

      return;

    }


    const categories =
      data.map(

        item =>
          item?._id || ''

      );


    const values =
      data.map(

        item =>
          Number(
            item?.count || 0
          )

      );


    this.usersChart = {

      ...this.usersChart,

      series: [

        {

          name:
            'New Users',

          data:
            values

        }

      ],

      xaxis: {

        categories

      }

    };

  }


  // ====================================================
  // MESSAGES PER DAY
  // ====================================================

  createMessagesChart(
    data: any[]
  ): void {

    if (
      !Array.isArray(data)
    ) {

      return;

    }


    const categories =
      data.map(

        item =>
          item?._id || ''

      );


    const values =
      data.map(

        item =>
          Number(
            item?.count || 0
          )

      );


    this.messagesChart = {

      ...this.messagesChart,

      series: [

        {

          name:
            'Messages',

          data:
            values

        }

      ],

      xaxis: {

        categories

      }

    };

  }


  // ====================================================
  // PRO CONVERSIONS
  // ====================================================

  createConversionChart(
    data: any[]
  ): void {

    if (
      !Array.isArray(data)
    ) {

      return;

    }


    const categories =
      data.map(

        item =>
          item?._id || ''

      );


    const values =
      data.map(

        item =>
          Number(
            item?.count || 0
          )

      );


    this.conversionChart = {

      ...this.conversionChart,

      series: [

        {

          name:
            'Pro Conversions',

          data:
            values

        }

      ],

      xaxis: {

        categories

      }

    };

  }


  // ====================================================
  // REVENUE
  // ====================================================

  createRevenueChart(
    data: any[]
  ): void {

    if (
      !Array.isArray(data)
    ) {

      return;

    }


    const categories =
      data.map(

        item =>
          item?.date || ''

      );


    const values =
      data.map(

        item =>
          Number(
            item?.revenue || 0
          )

      );


    this.revenueChart = {

      ...this.revenueChart,

      series: [

        {

          name:
            'Revenue',

          data:
            values

        }

      ],

      xaxis: {

        categories

      }

    };

  }


  // ====================================================
  // REFRESH BUTTON
  // ====================================================

  refresh(): void {

    this.loadDashboard();

  }

}