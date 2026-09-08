<template>
  <Bar :data="chartData" :options="resolvedOptions" />
</template>

<script>
import { Bar } from 'vue-chartjs';

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    resolvedOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        ...this.chartOptions
      };
    }
  }
};
</script>
