<template v-if="enabled != false">
  <div v-if="chartData && version == 'Line'" class="chart-card">
    <h4>{{ $t(`${title}`) }}</h4>
    <div class="chartWrap">
      <ChartJSLine :chartData="chartData" :chartOptions="chartConfig" />
    </div>
    <div class="chartWrapper">
      <div class="leftSide">
        <div class="total amountText" v-if="typeText">
          {{
            roundToDecimals(chartData.datasets[0]?.data?.[chartData.datasets[0]?.data.length - 1]?.y, 2)
          }}
          {{ typeText }}
        </div>
        <div
          v-if="typeText"
          :class="{
            amountText: true,
            percentage: true,
            green:
              calculatePercentage(
                chartData.datasets[0]?.data[0]?.y,
                chartData.datasets[0]?.data[chartData.datasets[0]?.data.length - 1]?.y,
                '-'
              ) > 0,
            red:
              calculatePercentage(
                chartData.datasets[0]?.data[0]?.y,
                chartData.datasets[0]?.data[chartData.datasets[0]?.data.length - 1]?.y,
                '-'
              ) < 0,
            black:
              calculatePercentage(
                chartData.datasets[0]?.data[0]?.y,
                chartData.datasets[0]?.data[chartData.datasets[0]?.data.length - 1]?.y,
                '-'
              ) == 0
          }"
        >
          <span v-if="!percentageDisabled">
            {{ chartData.datasets[0]?.data ? getPercentage(chartData.datasets[0]?.data) : 'Something is wrong %' }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="chartData && version == 'Pie'" class="chart-card">
    <h4>{{ $t(`${title}`) }}</h4>
    <div class="chartWrap">
      <ChartJSPie :chartData="chartData" :chartOptions="pieConfig" />
    </div>
  </div>
  <div v-else-if="chartData && version == 'Bar'" class="chart-card">
    <h4>{{ $t(`${title}`) }}</h4>
    <div class="chartWrap">
      <ChartJSBar :chartData="chartData" :chartOptions="chartConfig" />
    </div>
  </div>
  <div v-else><p>You did not specify a correct version!</p></div>
</template>

<script lang="ts">
import calculatePercentage from '../../utils/Calculating/calculatePercentage';
import roundToDecimals from '../../utils/Transforming/roundToDecimals';
import ChartJSLine from '../ChartJS/Line.vue';
import ChartJSPie from '../ChartJS/Pie.vue';
import ChartJSBar from '../ChartJS/Bar.vue';
import 'chart.js/auto';

export default {
  components: {
    ChartJSLine,
    ChartJSPie,
    ChartJSBar
  },
  data() {
    return {
      chartConfig: {},
      pieConfig: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              font: { family: 'DM Sans', size: 12 }
            }
          }
        }
      }
    };
  },
  props: {
    config: {
      required: false,
      type: Object
    },
    chartData: {
      required: true,
      type: Object
    },
    version: {
      required: true,
      type: String
    },
    title: {
      required: true,
      type: String
    },
    average: {
      required: false,
      type: Boolean
    },
    typeText: {
      required: false,
      type: String
    },
    enabled: {
      required: false,
      type: Boolean
    },
    percentageDisabled: {
      required: false,
      type: Boolean
    }
  },
  methods: {
    calculatePercentage,
    roundToDecimals,
    getPercentage(array: any) {
      const first = array[0]?.y;
      const last = array[array.length - 1]?.y;
      const change = calculatePercentage(first, last, '-');
      return `${change <= 0 ? '' : '+'}${change}%`;
    }
  },

  mounted() {
    const chartConfig = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: false,
          stacked: false,
          grid: {
            color: 'rgba(148, 163, 184, 0.25)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'DM Sans', size: 11 }
          }
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
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: { family: 'DM Sans', size: 11 }
          }
        }
      },
      spanGaps: true,
      plugins: {
        legend: {
          labels: {
            boxWidth: 10,
            usePointStyle: true,
            font: { family: 'DM Sans', size: 12 }
          }
        },
        tooltip: {
          callbacks: {},
          position: 'nearest'
        }
      }
    };

    this.chartConfig = chartConfig;
  }
};
</script>
