<template>
  <main
    :key="Configs.charts.totalGigabytes"
    class="dashboard"
    v-if="loadingDone"
  >
    <div v-if="noData" class="dashboard_empty">
      <p>{{ $t('select.geenResultaat') }}</p>
    </div>
    <div class="dashboard_header">
      <v-btn size="small" rounded="xl" prepend-icon="mdi-chevron-left" variant="tonal" color="#0f766e">
        <router-link :to="{ name: 'home' }" class="backLink">
          {{ $t('getBackButton') }}
        </router-link>
      </v-btn>
      <div class="dashboard_title">{{ $t('dashboardTitle') }} — {{ currentDatabase }}</div>
    </div>
    <div class="dashboardCollum">
      <GraphWrapper
        :key="Configs.charts.totalGigabytes"
        :config="Configs.config"
        :chartData="Configs.charts.totalGigabytes"
        :version="'Line'"
        :title="'total.Gigabytes.title'"
        :typeText="'GB'"
      />
      <GraphWrapper
        :key="Configs.charts.totalUsers"
        :config="Configs.config"
        :chartData="Configs.charts.totalUsers"
        :version="'Line'"
        :title="'total.Users.title'"
        :typeText="$t(`total.Users.subTitle`)"
      />
    </div>
    <div class="dashboardCollum">
      <GraphWrapper
        :key="Configs.charts.percentageAverageGigabytes"
        :config="Configs.config"
        :chartData="Configs.charts.averageGigabytes"
        :version="'Line'"
        :average="true"
        :title="'averageCompany.Gigabytes.title'"
        :typeText="'%'"
        :percentageDisabled="true"
      />

      <GraphWrapper
        :key="Configs.charts.percentageAverageUsers"
        :config="Configs.config"
        :chartData="Configs.charts.averageUsers"
        :version="'Line'"
        :average="true"
        :title="'averageCompany.Users.title'"
        :typeText="$t(`averageCompany.Users.subTitle`)"
        :percentageDisabled="true"
      />
    </div>

    <div class="dashboardCollum">
      <GraphWrapper
        :key="Configs.charts.types"
        :chartData="Configs.charts.types"
        :version="'Pie'"
        :title="'typesOfData.title'"
      />

      <div class="growth-slot">
        <GrowthPicker @update:selectedItem="updateGrowthFilter($event)" />
        <GraphWrapper
          :key="Configs.charts.growth.datasets"
          :config="Configs.config"
          :chartData="Configs.charts.growth"
          :version="'Line'"
          :title="'growthUsersAndGB.title'"
        />
      </div>
    </div>
    <div class="dashboardCollum">
      <GraphWrapper
        :enabled="false"
        :key="Configs.charts.weekData"
        :chartData="Configs.charts.weekData"
        :version="'Bar'"
        :title="'weekData.title'"
      />
      <GraphWrapper
        :key="Configs.charts.predicted"
        :config="Configs.config"
        :chartData="Configs.charts.predicted"
        :version="'Line'"
        :title="'predicted.title'"
      />
    </div>
  </main>
  <div v-else-if="loadError" class="dashboard_loading">
    <p>{{ $t('select.geenResultaat') }}</p>
    <v-btn variant="tonal" @click="retryLoad">{{ $t('getBackButton') }}</v-btn>
  </div>
  <div v-else class="dashboard_loading">
    <loadingCircle />
  </div>
</template>

<script lang="ts" setup>
import 'chartjs-adapter-luxon';
import { reactive, ref, onBeforeMount, watch } from 'vue';
import { push } from 'notivue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import loadingCircle from '../components/loadingCircle.vue';
import GraphWrapper from '../components/Graph/GraphWrapper.vue';
import GrowthPicker from '../components/GrowthPicker.vue';

import IConfigs from '../interfaces/IConfigs';
import MetricsService from '../services/MetricsService.service';
import GraphHandler from '../utils/Handlers/GraphHandler';
import calculateAverage from '../utils/Calculating/calculateAverage';
import growth from '../utils/Calculating/calculateGrowth';
import calculatePercentage from '../utils/Calculating/calculatePercentage';
import { MetricsFilter } from '../types/MetricsFilter';
import { useFilterStore } from '../stores/filters';
import { update } from '../stores/update';
import differenceTwoDates from '../utils/Transforming/differenceTwoDates';
import { isEmptyMetrics } from '../utils/normalizeMetrics';

const loadingDone = ref(false);
const loadError = ref(false);
const noData = ref(false);
const Configs: IConfigs = reactive({
  charts: {
    totalGigabytes: [],
    totalUsers: [],
    percentageAverageGigabytes: [],
    percentageAverageUsers: [],
    types: [],
    growth: [],
    predicted: [],
    weekData: []
  },
  config: {
    type: 'line',
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        }
      }
    }
  }
});

const route = useRoute();
const currentDatabase = ref('');
currentDatabase.value = String(route.params.database);

let graphHandlerData = ref();

let formattedFilter = reactive<any>({
  companies: '',
  fromDate: '',
  toDate: '',
  dates: []
});

const metricsService = new MetricsService();
const filterStore = useFilterStore();
const { t } = useI18n();

const getMetrics = async (filter?: MetricsFilter): Promise<boolean> => {
  loadError.value = false;
  const pending = push.promise({
    title: 'Loading',
    message: 'Fetching metrics...',
    duration: Infinity
  });

  try {
    const companies = [currentDatabase.value, 'null'];
    const fromDate = filter?.fromDate;
    const toDate = filter?.toDate;
    const dates = filter?.dates;

    formattedFilter = {
      companies,
      fromDate,
      toDate,
      dates
    };

    const statistics = await metricsService.statistics(formattedFilter);
    const allStatistics = await metricsService.statistics();
    const metrics = await metricsService.metrics(formattedFilter);
    const allMetrics = await metricsService.metrics({
      fromDate,
      toDate,
      dates
    });
    const weekMetrics = await metricsService.weekMetrics(formattedFilter);
    const predictionMetrics = await metricsService.predictionMetrics(formattedFilter);
    const metricsData = metrics.data;
    const allMetricsData = allMetrics.data;
    const statisticsData = statistics.data;
    const allStatisticsData = allStatistics.data;
    const growthMetrics = (await growth(metricsData.metrics)) ?? { GB: [], MFCP: [], Corresp: [], Users: [] };
    const closeToLimit = await metricsService.closeToLimit();
    const averageGb: any[] = [];
    const averageUs: any[] = [];
    const averageActUs: any[] = [];
    noData.value = isEmptyMetrics(metricsData);

    if (closeToLimit === 1) {
      push.warning({
        title: 'Warning',
        message: 'You are close to reaching the limit of your amount of requests.',
        duration: 3500,
        ariaLive: 'polite',
        ariaRole: 'status'
      });
    } else if (closeToLimit === 2) {
      push.error({
        title: 'Error',
        message: 'You are out of requests. Please try again later.',
        duration: 3500,
        ariaLive: 'polite',
        ariaRole: 'status'
      });
    }

    for (let i = 0; i < allMetricsData.metrics.length; i++) {
      if (allMetricsData.metrics[i].Type === 'database_size') {
        averageGb.push({
          x: '',
          y: calculateAverage(allMetricsData.metrics[i].IntData, allStatisticsData.Length)
        });
      }
      if (allMetricsData.metrics[i].Type === 'users') {
        averageUs.push({
          x: '',
          y: allMetricsData.metrics[i]
            ? Math.round(calculateAverage(allMetricsData.metrics[i].IntData, allStatisticsData.Length))
            : 0
        });
      }
      if (allMetricsData.metrics[i].Type === 'active_users') {
        averageActUs.push({
          x: '',
          y: allMetricsData.metrics[i]
            ? Math.round(calculateAverage(allMetricsData.metrics[i].IntData, allStatisticsData.Length))
            : 0
        });
      }
    }

    for (let i = 0; i < averageGb.length; i++) {
      averageGb[i].x = allMetricsData.chartData.GB[i]?.x || averageGb[i].x;
    }
    for (let i = 0; i < averageUs.length; i++) {
      averageUs[i].x = allMetricsData.chartData.US[i]?.x || averageUs[i].x;
    }
    for (let i = 0; i < averageActUs.length; i++) {
      averageActUs[i].x = allMetricsData.chartData.ACT_US[i]?.x || averageActUs[i].x;
    }

    const averageGbByDate = new Map(allMetricsData.chartData.GB.map((point, i) => [point.x, averageGb[i]?.y]));
    const averageUsByDate = new Map(allMetricsData.chartData.US.map((point, i) => [point.x, averageUs[i]?.y]));
    const averageActUsByDate = new Map(
      allMetricsData.chartData.ACT_US.map((point, i) => [point.x, averageActUs[i]?.y])
    );

    const percentageAverageGb = metricsData.chartData.GB.map((point) => ({
      x: point.x,
      y: Math.round(calculatePercentage(averageGbByDate.get(point.x), point.y, ''))
    }));
    const percentageAverageUs = metricsData.chartData.US.map((point) => ({
      x: point.x,
      y: Math.round(calculatePercentage(averageUsByDate.get(point.x), point.y, ''))
    }));
    const percentageAverageActUs = metricsData.chartData.ACT_US.map((point) => ({
      x: point.x,
      y: Math.round(calculatePercentage(averageActUsByDate.get(point.x), point.y, ''))
    }));

    graphHandlerData.value = new GraphHandler(
      metricsData.chartData,
      [metricsData.chartData.US, metricsData.chartData.ACT_US],
      percentageAverageGb,
      [percentageAverageUs, percentageAverageActUs],
      growthMetrics,
      predictionMetrics.data,
      weekMetrics.data,
      statisticsData.Types,
      true,
      t
    );

    if (!graphHandlerData.value) {
      pending.reject({
        title: 'Error',
        message: 'An error occurred while trying to create the metrics. Please try again later.',
        duration: Infinity,
        ariaLive: 'assertive',
        ariaRole: 'alert'
      });
      return false;
    }

    Configs.charts.totalGigabytes = graphHandlerData.value.charts.totalGigabytes;
    Configs.charts.totalUsers = graphHandlerData.value.charts.totalUsers;
    Configs.charts.averageGigabytes = graphHandlerData.value.charts.averageGigabytes;
    Configs.charts.averageUsers = graphHandlerData.value.charts.averageUsers;
    Configs.charts.types = graphHandlerData.value.charts.types;
    Configs.charts.growth = graphHandlerData.value.charts.growth;
    Configs.charts.predicted = graphHandlerData.value.charts.predicted;
    Configs.charts.weekData = graphHandlerData.value.charts.weekData;

    pending.resolve({
      title: noData.value ? 'No data' : 'Success',
      message: noData.value ? 'No metrics available. Showing an empty dashboard.' : 'Metrics fetched successfully.',
      duration: 1000,
      ariaLive: 'polite',
      ariaRole: 'status'
    });

    return true;
  } catch (error: any) {
    loadError.value = true;
    pending.reject({
      title: 'Error',
      message: 'An error occurred while fetching the metrics. Please try again later.',
      duration: Infinity,
      ariaLive: 'assertive',
      ariaRole: 'alert'
    });
    return false;
  }
};

const retryLoad = async () => {
  loadingDone.value = false;
  loadingDone.value = await getMetrics();
};

// BeforeMount
onBeforeMount(async () => {
  loadingDone.value = false;
  const done = await getMetrics();
  loadingDone.value = done;
});

watch(update, async () => {
  loadingDone.value = false;
  let done = false;
  const dates = filterStore.getSelectedDates();
  const companies = filterStore.getSelectedDatabases();
  if (dates.length > 2) {
    done = await getMetrics({
      companies: companies,
      dates: dates.map((date) => differenceTwoDates(date)).reverse()
    });
  } else if (dates[0] && dates[1]) {
    const formattedDateOne = differenceTwoDates(dates[0]);
    const formattedDateTwo = differenceTwoDates(dates[dates.length - 1]);

    done = await getMetrics({
      companies: companies,
      fromDate: formattedDateOne,
      toDate: formattedDateTwo
    });
  } else {
    done = await getMetrics({
      companies: companies
    });
  }
  loadingDone.value = done;
});

const updateGrowthFilter = (event: string) => {
  switch (event) {
    case 'Database':
      Configs.charts.growth.datasets = [graphHandlerData.value.dataGrowth[0]];
      break;
    case 'MFCP':
      Configs.charts.growth.datasets = [graphHandlerData.value.dataGrowth[1]];
      break;
    case 'Correspondentie':
    case 'Correspondence':
      Configs.charts.growth.datasets = [graphHandlerData.value.dataGrowth[2]];
      break;
    case 'Gebruikers':
    case 'Users':
      Configs.charts.growth.datasets = [graphHandlerData.value.dataGrowth[3]];
      break;
  }
};
</script>

<style lang="scss" scoped>
.dashboard_header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.loading {
  width: 100%;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
