<template>
  <layoutHeader
    v-if="currentRoute !== '/login' && currentRoute !== '/error'"
    :updateChevron="updateChevron"
    :selected-dates="selectedDates"
    :user="user"
    class="layout_header"
  ></layoutHeader>
  <profileMenu v-if="currentRoute !== '/login' && currentRoute !== '/error'"></profileMenu>
  <v-spacer></v-spacer>
  <v-menu
    v-if="currentRoute !== '/profile' && currentRoute !== '/settings' && currentRoute !== '/login'"
    v-model="menu"
    :location="'bottom center'"
    activator=".menu-activator"
    transition="slide-x-transition"
    :close-on-content-click="false"
    :close-on-back="true"
    :persistent="true"
    :open-delay="0"
    :close-delay="0"
    max-height="300"
    width="450"
  >
    <v-list>
      <div class="layout_filters">
        <layoutFilter
          @data-change-typing="formatDates($event)"
          @data-change-calendar="selectedDates = $event"
          class="layout_filter menu-activator"
        ></layoutFilter>
        <v-spacer></v-spacer>
        <layoutSelect
          v-if="currentRoute === '/'"
          class="layout_selector menu-activator"
          :databases="databases"
          @data-change="selectedDatabases = $event"
        ></layoutSelect>
        <v-spacer></v-spacer>
        <div class="buttonDivider">
          <saveFilterButton
            class="layout_save_button"
            @click="updateChevron++"
            @data-saving="activateFilter(selectedDatabases)"
          ></saveFilterButton>
          <clearFilterButton
            class="layout_clear_button"
            @click.prevent="
              updateChevron++;
              selectedDatabases = [];
              selectedDates = [];
              menu = false;
              filterStore.resetFilters();
              updateFilter();
            "
          ></clearFilterButton>
        </div>
      </div>
    </v-list>
  </v-menu>
  <section
    class="layout_content"
    :class="currentRoute === '/login' || currentRoute === '/error' ? 'no_padding_content' : ''"
  >
    <slot name="content" @updateRoute="currentRoute = $event"></slot>
  </section>
</template>

<script lang="ts" setup>
import { reactive, ref, onBeforeMount, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { push } from 'notivue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useColors } from 'vuestic-ui';
import { useTheme } from 'vuetify';

import layoutHeader from '../components/Layout/headerComponent.vue';
import layoutFilter from '../components/Layout/filterComponent.vue';
import layoutSelect from '../components/Layout/selectComponent.vue';
import saveFilterButton from '../components/Layout/saveFilterButton.vue';
import clearFilterButton from '../components/Layout/clearFilterButton.vue';
import profileMenu from '../components/Layout/profileMenu.vue';
import transformTime from '../utils/Transforming/transformTime';
import { useFilterStore } from '../stores/filters';
import { updateFilter } from '../stores/update';
import ApiService from '../services/ApiService.service';

const vuetifyTheme = useTheme();
const { applyPreset } = useColors();

const deniedRoutes = ['/login'];

defineEmits(['change-chevron']);

let selectedDates = reactive<string[]>([]);
let selectedDatabases = reactive<string[]>([]);
let databases = reactive<string[]>([]);
const currentRoute = ref('');
const menu = ref(false);
const filterStore = useFilterStore();
const updateChevron = ref(0);
const route = useRoute();

const apiService = new ApiService();
const auth0 = useAuth0();
const user = ref(auth0.user);
const isAuthenticated = ref(auth0.isAuthenticated);

watch(
  () => route.fullPath,
  (path) => {
    currentRoute.value = path;
  },
  { immediate: true }
);

const fetchDatabases = async () => {
  const response = await apiService.fetchApi('/database/metrics/list');
  databases = [];
  response.data.forEach((database: string) => databases.push(database));
};

const formatDates = async (dates: number[]) => {
  const formattedDates = dates.map((element: any) => {
    const convertedToDate = transformTime(element);
    const year = new Date(convertedToDate).getFullYear();
    const month = new Date(convertedToDate).getMonth();
    const date = new Date(convertedToDate).getDate();
    return `${date}-${month + 1}-${year}`;
  });
  selectedDates = formattedDates;
};

const activateFilter = (databasesSelected: any) => {
  menu.value = false;
  if (selectedDates.length < 2 && databasesSelected[0] === '')
    return push.warning({
      title: 'Warning',
      message: 'Filters have not been applied. No filters selected.',
      duration: 1500
    });
  filterStore.setSelectedDates(selectedDates);
  filterStore.setSelectedDatabases(databasesSelected);
  updateFilter();
};

onMounted(async () => {
  if (
    !deniedRoutes.includes(currentRoute.value) &&
    isAuthenticated.value &&
    (!databases || databases.length === 0 || databases[0] === '')
  ) {
    await fetchDatabases();
    selectedDates = filterStore.getSelectedDates();
    selectedDatabases = filterStore.getSelectedDatabases();
    const theme = localStorage.getItem('theme');
    if (theme) {
      applyPreset(theme);
      vuetifyTheme.global.name.value = vuetifyTheme.global.current.value.dark ? 'light' : 'dark';
    }
  }
});
</script>

<style lang="scss" scoped>
.layout {
  &_filters {
    padding: 1rem;
    min-width: 25rem;
    max-width: 25rem;
  }

  &_filter {
    min-width: 25rem;
    max-width: 25rem;
  }

  &_content {
    padding-top: 5rem;
    width: 100%;
    height: 100%;
  }
}

.no_padding_content {
  padding-top: 0;
}

.buttonDivider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
