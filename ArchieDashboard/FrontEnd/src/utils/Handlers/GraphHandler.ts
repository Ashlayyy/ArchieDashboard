import 'chartjs-adapter-luxon';
import transformSize from '../Transforming/transformSize';
import { sortChartPoints } from '../chartPoints';

const LINE_COLORS = ['#0f766e', '#f59e0b', '#2563eb', '#db2777'];

function lineDataset(label: string, data: any, colorIndex: number) {
  return {
    label,
    data: sortChartPoints(data),
    fill: false,
    borderColor: LINE_COLORS[colorIndex % LINE_COLORS.length],
    backgroundColor: LINE_COLORS[colorIndex % LINE_COLORS.length],
    borderWidth: 2,
    tension: 0.15,
    spanGaps: true,
    pointRadius: 2,
    pointHoverRadius: 5
  };
}

export default class GraphHandler {
  charts: any = {
    totalGigabytes: {},
    totalUsers: {},
    averageGigabytes: {},
    averageUsers: {},
    growth: {},
    predicted: {},
    weekData: {},
    types: {}
  };
  dataGrowth: any = {};
  config = {};
  translationNeeded: boolean;
  translate: any;

  //TODO Needs to be strongly typed
  constructor(
    totalGB: any,
    totalUsers: any,
    averageGB: any,
    averageUsers: any,
    growth: any,
    predicted: any,
    WeekDataArray: Array<number>,
    TypeArray: Array<number>,
    translationNeeded?: boolean,
    translate?: any
  ) {
    this.translate = translate || ((key: string) => key);
    this.translationNeeded = translationNeeded || false;
    const safeGrowth = growth ?? { GB: [], MFCP: [], Corresp: [], Users: [] };
    const emptySeries = { predictedData: [], dateArray: [] };
    const safePredicted = {
      predictedGB: predicted?.predictedGB ?? emptySeries,
      predictedMFCP: predicted?.predictedMFCP ?? emptySeries,
      predictedCO: predicted?.predictedCO ?? emptySeries,
      predictedUS: predicted?.predictedUS ?? emptySeries,
      predictedACTUS: predicted?.predictedACTUS ?? emptySeries
    };
    this.createLineCharts(totalGB ?? {}, totalUsers ?? [[], []], averageGB ?? [], averageUsers ?? [[], []], safeGrowth, safePredicted);
    this.createBarChart(Array.isArray(WeekDataArray) ? WeekDataArray : []);
    this.createPieCharts(Array.isArray(TypeArray) ? TypeArray : []);
    this.createConfig();
  }

  async createLineCharts(
    totalGB: any,
    totalUsers: any,
    averageGB: any,
    averageUsers: any,
    growth: any,
    predicted: any
  ) {
    this.charts.totalGigabytes = {
      datasets: [
        lineDataset(this.translate('total.Gigabytes.lineOne'), totalGB.GB ?? [], 0),
        lineDataset(this.translate('total.Gigabytes.lineTwo'), totalGB.CO ?? [], 1)
      ],
      responsive: true,
      maintainAspectRatio: false
    };

    this.charts.totalUsers = {
      datasets: [
        lineDataset(this.translate('total.Users.lineOne'), totalUsers[0], 0),
        lineDataset(this.translate('total.Users.lineTwo'), totalUsers[1], 1)
      ],
      responsive: true,
      maintainAspectRatio: false
    };

    this.charts.averageGigabytes = {
      datasets: [
        lineDataset(
          this.translationNeeded
            ? this.translate('averageCompany.Gigabytes.lineOne')
            : this.translate('average.Gigabytes.lineOne'),
          averageGB,
          0
        )
      ],
      responsive: true,
      maintainAspectRatio: false
    };

    this.charts.averageUsers = {
      datasets: [
        lineDataset(
          this.translationNeeded
            ? this.translate('averageCompany.Users.lineOne')
            : this.translate('average.Users.lineOne'),
          averageUsers[0],
          0
        ),
        lineDataset(
          this.translationNeeded
            ? this.translate('averageCompany.Users.lineTwo')
            : this.translate('average.Users.lineTwo'),
          averageUsers[1],
          1
        )
      ],
      responsive: true,
      maintainAspectRatio: false
    };

    this.charts.growth = {
      datasets: [lineDataset(this.translate('growth.types.1'), growth.GB ?? [], 0)],
      responsive: true,
      maintainAspectRatio: false
    };

    this.dataGrowth = [
      lineDataset(this.translate('growth.types.1'), growth.GB ?? [], 0),
      lineDataset(this.translate('growth.types.2'), growth.MFCP ?? [], 1),
      lineDataset(this.translate('growth.types.3'), growth.Corresp ?? [], 0),
      lineDataset(this.translate('growth.types.4'), growth.Users ?? [], 1)
    ];

    this.charts.predicted = {
      labels: predicted.predictedGB?.dateArray ?? [],
      datasets: [
        {
          label: this.translate('predicted.types.1'),
          data: predicted.predictedGB?.predictedData ?? [],
          fill: false,
          borderColor: LINE_COLORS[0],
          backgroundColor: LINE_COLORS[0],
          tension: 0
        },
        {
          label: this.translate('predicted.types.2'),
          data: predicted.predictedMFCP?.predictedData ?? [],
          fill: false,
          borderColor: LINE_COLORS[1],
          backgroundColor: LINE_COLORS[1],
          tension: 0
        },
        {
          label: this.translate('predicted.types.3'),
          data: predicted.predictedCO?.predictedData ?? [],
          fill: false,
          borderColor: LINE_COLORS[2],
          backgroundColor: LINE_COLORS[2],
          tension: 0
        },
        {
          label: this.translate('predicted.types.4'),
          data: predicted.predictedUS?.predictedData ?? [],
          fill: false,
          borderColor: LINE_COLORS[3],
          backgroundColor: LINE_COLORS[3],
          tension: 0
        }
      ],
      responsive: true,
      maintainAspectRatio: false
    };
  }

  async createBarChart(WeekDataArray: Array<any>) {
    this.charts.weekData = {
      labels: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
      datasets: [
        {
          label: this.translate('growth.types.1'),
          data: WeekDataArray.map((item: any) => {
            if (item.Type === 'database_size') return transformSize(item.IntData);
            else return;
          }).filter((item) => item !== undefined && item !== null),
          fill: false,
          backgroundColor: LINE_COLORS[0],
          borderColor: LINE_COLORS[0],
          tension: 0
        },
        {
          label: this.translate('growth.types.2'),
          data: WeekDataArray.map((item: any) => {
            if (item.Type === 'mfcp_size') return transformSize(item.IntData);
            else return;
          }).filter((item) => item !== undefined && item !== null),
          fill: false,
          backgroundColor: LINE_COLORS[1],
          borderColor: LINE_COLORS[1],
          tension: 0
        },
        {
          label: this.translate('growth.types.3'),
          data: WeekDataArray.map((item: any) => {
            if (item.Type === 'corresp_size') return transformSize(item.IntData);
            else return;
          }).filter((item) => item !== undefined && item !== null),
          fill: false,
          backgroundColor: LINE_COLORS[2],
          borderColor: LINE_COLORS[2],
          tension: 0
        },
        {
          label: this.translate('growth.types.4'),
          data: WeekDataArray.map((item: any) => {
            if (item.Type === 'users') return item.IntData;
            else return;
          }).filter((item) => item !== undefined && item !== null),
          fill: false,
          backgroundColor: LINE_COLORS[3],
          borderColor: LINE_COLORS[3],
          tension: 0
        },
        {
          label: this.translate('growth.types.5'),
          data: WeekDataArray.map((item: any) => {
            if (item.Type === 'active_users') return item.IntData;
            else return;
          }).filter((item) => item !== undefined && item !== null),
          fill: false,
          backgroundColor: '#64748b',
          borderColor: '#64748b',
          tension: 0
        }
      ],
      responsive: true,
      maintainAspectRatio: false
    };
  }

  async createPieCharts(TypeArray: Array<any>) {
    const types = Array.isArray(TypeArray) ? TypeArray : [];
    const labelArray = types.map((type) => {
      const name = String(type?.Type || 'No data available');
      if (name === 'mfcp_size') {
        return 'MFCP';
      }
      const firstWord = name.replace('_', ' ').split(' ')[0];
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    });
    this.charts.types = {
      labels: labelArray,
      datasets: [
        {
          data: types.map((type) => type.Amount),
          backgroundColor: ['#0f766e', '#f59e0b', '#2563eb', '#db2777', '#64748b'],
          hoverOffset: 4
        }
      ]
    };
  }

  async createConfig() {
    this.config = {
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: false,
          stacked: false
        },
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
          adapters: {
            date: {
              locale: 'nl'
            }
          }
        }
      },
      plugins: {
        tooltip: {
          position: 'nearest'
        }
      }
    };
  }
}
