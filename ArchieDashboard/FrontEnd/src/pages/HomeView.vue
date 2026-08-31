<template>
  <main class="dashboard" v-if="Configs?.charts?.totalGigabytes && loadingDone == true">
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

      <div>
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
import differenceTwoDates from '../utils/Transforming/differenceTwoDates';

const gridMetrics = ref<any>();
const loadingDone = ref(false);
const loadError = ref(false);
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
    gridMetrics.value = (await metricsService.gridMetrics()).data;
    const predictionMetrics = await metricsService.predictionMetrics(formattedFilter);
    const growthMetrics = await growth(metrics.data.metrics);
    const closeToLimit = await metricsService.closeToLimit();
    const averageGb: any[] = [];
    const averageUs: any[] = [];
    const averageActUs: any[] = [];
    let totalGb: number = 0;

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

    totalGb = totalGb + metrics.data.chartData.GB[1].y;
    totalGb = totalGb + metrics.data.chartData.MFCP[1].y;

    for (let i = 0; i < metrics.data.metrics.length; i++) {
      if (metrics.data.metrics[i].Type === 'database_size') {
        averageGb.push({
          x: '',
          y: metrics.data.metrics[i] ? calculateAverage(metrics.data.metrics[i].IntData, statistics.data.Length) : 0
        });
      }
      if (metrics.data.metrics[i].Type === 'users') {
        averageUs.push({
          x: '',
          y: metrics.data.metrics[i]
            ? Math.round(calculateAverage(metrics.data.metrics[i].IntData, statistics.data.Length))
            : 0
        });
      }
      if (metrics.data.metrics[i].Type === 'active_users') {
        averageActUs.push({
          x: '',
          y: metrics.data.metrics[i]
            ? Math.round(calculateAverage(metrics.data.metrics[i].IntData, statistics.data.Length))
            : 0
        });
      }
    }

    for (let i = 0; i < averageGb.length; i++) {
      if (averageGb.length !== averageUs.length) {
        averageUs.push({
          x: '',
          y: 0
        });
      }

      if (averageGb.length !== averageActUs.length) {
        averageActUs.push({
          x: '',
          y: 0
        });
      }
    }

    gridMetrics.value.forEach((gridItem: any) => {
      const length = statistics.data.Length;
      const average = totalGb / length;
      gridItem.Average =
        Math.round((gridItem.Sizes.Total / average) * 100) !== undefined &&
        Math.round((gridItem.Sizes.Total / average) * 100) !== Infinity &&
        !isNaN(Math.round((gridItem.Sizes.Total / average) * 100))
          ? Math.round((gridItem.Sizes.Total / average) * 100)
          : 0;
    });

    for (let i = 0; i < metrics.data.chartData.GB.length; i++) {
      averageGb[i].x = metrics.data.chartData.GB[i].x;
      averageUs[i].x = !metrics.data.chartData.US[i] ? metrics.data.chartData.GB[i].x : metrics.data.chartData.US[i].x;
      averageActUs[i].x = !metrics.data.chartData.ACT_US[i]
        ? metrics.data.chartData.GB[i].x
        : metrics.data.chartData.ACT_US[i].x;
    }

    for (let i = 0; i < metrics.data.chartData.GB.length; i++) {
      if (metrics.data.chartData.ACT_US.length !== metrics.data.chartData.GB.length) {
        metrics.data.chartData.ACT_US.push({
          x: String(
            metrics.data.chartData.GB[i].x
          ),
          y: 0
        });
      }

      if (metrics.data.chartData.US.length !== metrics.data.chartData.GB.length) {
        metrics.data.chartData.US.push({
          x: String(metrics.data.chartData.GB[i].x),
          y: 0
        });
      }
    }

    graphHandlerData.value = new GraphHandler(
      metrics.data.chartData,
      [metrics.data.chartData.US, metrics.data.chartData.ACT_US],
      averageGb,
      [averageUs, averageActUs],
      growthMetrics,
      predictionMetrics.data,
      weekMetrics.data,
      statistics.data.Types,
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
      title: 'Success',
      message: 'Metrics fetched successfully.',
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

<style lang="scss">
@use '../assets/sass/abstracts/variables.scss';

.dashboard {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  flex-direction: column;
  text-align: start;
  padding: map-get(variables.$padding, 'globalPadding');

  &Collum {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5rem;
    flex-direction: row;
    padding: 2rem;
    width: 100%;
    height: max-content;
  }

  &_loading {
    display: flex;
    width: 100vw;
    height: 75vh;
    justify-content: center;
    align-items: center;
  }
}

.chartWrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: max-content;
}

.leftSide {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  text-align: start;
  padding: map-get(variables.$padding, 'chartPadding');
  color: map-get(variables.$colors, 'black');
}

.percentage.green {
  color: map-get(variables.$colors, 'green');
}
.percentage.red {
  color: map-get(variables.$colors, 'red');
}

.rightSide {
  padding: map-get(variables.$padding, 'chartPadding');
  color: map-get(variables.$colors, 'black');
}

.chartWrap {
  width: 500px;
  aspect-ratio: 2/1;
}

.loading {
  width: 90vw;
  display: flex;
  align-items: center;
  justify-content: center;
  height: max-content;
}

@media screen and (max-width: 1200px), screen and (max-device-width: 1200px) {
  .dashboard {
    &Collum {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5rem;
      flex-direction: column-reverse;
      padding: 2rem;
      width: 100%;
      height: max-content;
    }
  }
}
</style>
