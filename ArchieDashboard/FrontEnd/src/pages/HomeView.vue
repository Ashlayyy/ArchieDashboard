<template>
  <main class="dashboard" v-if="loadingDone">
    <div v-if="noData" class="dashboard_empty">
      <p>{{ $t('select.geenResultaat') }}</p>
    </div>
    <div class="dashboard_title">
      {{ $t('dashboardTitle') }}
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
        :key="Configs.charts.averageGigabytes"
        :config="Configs.config"
        :chartData="Configs.charts.averageGigabytes"
        :version="'Line'"
        :average="true"
        :title="'average.Gigabytes.title'"
        :typeText="'GB'"
      />

      <GraphWrapper
        :key="Configs.charts.averageUsers"
        :config="Configs.config"
        :chartData="Configs.charts.averageUsers"
        :version="'Line'"
        :average="true"
        :title="'average.Users.title'"
        :typeText="$t(`average.Users.subTitle`)"
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

    <section class="gridSection">
      <DatabaseGrid :data="gridMetrics" />
    </section>
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
import { useAuth0 } from '@auth0/auth0-vue';
import { useI18n } from 'vue-i18n';

import loadingCircle from '../components/loadingCircle.vue';
import GraphWrapper from '../components/Graph/GraphWrapper.vue';
import DatabaseGrid from '../components/Grid/DatabaseGrid.vue';
import GrowthPicker from '../components/GrowthPicker.vue';

import { MetricsFilter } from '../types/MetricsFilter';
import IConfigs from '../interfaces/IConfigs';
import MetricsService from '../services/MetricsService.service';
import GraphHandler from '../utils/Handlers/GraphHandler';
import calculateAverage from '../utils/Calculating/calculateAverage';
import growth from '../utils/Calculating/calculateGrowth';

import { update } from '../stores/update';
import { useFilterStore } from '../stores/filters';
import { isEmptyMetrics } from '../utils/normalizeMetrics';
import differenceTwoDates from '../utils/Transforming/differenceTwoDates';

const gridMetrics = ref<any>();
const loadingDone = ref(false);
const loadError = ref(false);
const noData = ref(false);
const Configs: IConfigs = reactive({
  charts: {
    totalGigabytes: [],
    totalUsers: [],
    averageGigabytes: [],
    averageUsers: [],
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

let graphHandlerData = ref();

let formattedFilter = reactive<any>({
  companies: '',
  fromDate: '',
  toDate: '',
  dates: []
});

const metricsService = new MetricsService();
const filterStore = useFilterStore();
const auth0 = useAuth0();
const isAuthenticated = ref(auth0.isAuthenticated);
const { t } = useI18n();

const getMetrics = async (filter?: MetricsFilter): Promise<boolean> => {
  loadError.value = false;
  const pending = push.promise({
    title: 'Loading',
    message: 'Fetching metrics...',
    duration: Infinity
  });

  try {
    const companies = filter?.companies && filter?.companies[0] !== '' ? filter?.companies : undefined;
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
    const metrics = await metricsService.metrics(formattedFilter);
    const weekMetrics = await metricsService.weekMetrics(formattedFilter);
    const gridResponse = await metricsService.gridMetrics();
    gridMetrics.value = Array.isArray(gridResponse.data) ? gridResponse.data : [];
    const predictionMetrics = await metricsService.predictionMetrics(formattedFilter);
    const metricsData = metrics.data;
    const statisticsData = statistics.data;
    const growthMetrics = (await growth(metricsData.metrics)) ?? { GB: [], MFCP: [], Corresp: [], Users: [] };
    const closeToLimit = await metricsService.closeToLimit();
    const averageGb: any[] = [];
    const averageUs: any[] = [];
    const averageActUs: any[] = [];
    let totalGb: number = 0;
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

    totalGb += metricsData.chartData.GB[metricsData.chartData.GB.length - 1]?.y ?? 0;

    for (let i = 0; i < metricsData.metrics.length; i++) {
      if (metricsData.metrics[i].Type === 'database_size') {
        averageGb.push({
          x: '',
          y: metricsData.metrics[i] ? calculateAverage(metricsData.metrics[i].IntData, statisticsData.Length) : 0
        });
      }
      if (metricsData.metrics[i].Type === 'users') {
        averageUs.push({
          x: '',
          y: metricsData.metrics[i]
            ? Math.round(calculateAverage(metricsData.metrics[i].IntData, statisticsData.Length))
            : 0
        });
      }
      if (metricsData.metrics[i].Type === 'active_users') {
        averageActUs.push({
          x: '',
          y: metricsData.metrics[i]
            ? Math.round(calculateAverage(metricsData.metrics[i].IntData, statisticsData.Length))
            : 0
        });
      }
    }

    for (let i = 0; i < averageGb.length; i++) {
      averageGb[i].x = metricsData.chartData.GB[i]?.x || averageGb[i].x;
    }
    for (let i = 0; i < averageUs.length; i++) {
      averageUs[i].x = metricsData.chartData.US[i]?.x || averageUs[i].x;
    }
    for (let i = 0; i < averageActUs.length; i++) {
      averageActUs[i].x = metricsData.chartData.ACT_US[i]?.x || averageActUs[i].x;
    }

    gridMetrics.value.forEach((gridItem: any) => {
      const length = statisticsData.Length || 1;
      const average = totalGb / length;
      gridItem.Average =
        Math.round((gridItem.Sizes.Total / average) * 100) !== undefined &&
        Math.round((gridItem.Sizes.Total / average) * 100) !== Infinity &&
        !isNaN(Math.round((gridItem.Sizes.Total / average) * 100))
          ? Math.round((gridItem.Sizes.Total / average) * 100)
          : 0;
    });

    graphHandlerData.value = new GraphHandler(
      metricsData.chartData,
      [metricsData.chartData.US, metricsData.chartData.ACT_US],
      averageGb,
      [averageUs, averageActUs],
      growthMetrics,
      predictionMetrics.data,
      weekMetrics.data,
      statisticsData.Types,
      false,
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

const loadFromStore = async (): Promise<boolean> => {
  loadError.value = false;
  loadingDone.value = false;
  const dates = filterStore.getSelectedDates();
  const companies = filterStore.getSelectedDatabases();
  if (dates.length > 2) {
    return getMetrics({
      companies: companies,
      dates: dates.map((date) => differenceTwoDates(date)).reverse()
    });
  }
  if (dates[0] && dates[1]) {
    return getMetrics({
      companies: companies,
      fromDate: differenceTwoDates(dates[0]),
      toDate: differenceTwoDates(dates[dates.length - 1])
    });
  }
  return getMetrics({
    companies: companies
  });
};

const retryLoad = async () => {
  loadingDone.value = await loadFromStore();
};

onBeforeMount(async () => {
  if (!isAuthenticated.value) {
    loadError.value = true;
    return;
  }
  loadingDone.value = await loadFromStore();
});

watch(update, async () => {
  loadingDone.value = await loadFromStore();
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
.loading {
  width: 100%;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
