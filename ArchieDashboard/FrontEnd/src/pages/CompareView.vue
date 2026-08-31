<template>
  <main class="dashboard" v-if="companies.length">
    <v-btn size="large" rounded="xl" prepend-icon="mdi-chevron-left" variant="tonal">
      <router-link :to="{ name: 'home' }" class="backLink">
        {{ $t('getBackButton') }}
      </router-link>
    </v-btn>
    <h1>{{ $t('buttonTekst.compare') }}</h1>
    <ul>
      <li v-for="company in companies" :key="company">
        <router-link :to="{ name: 'database', params: { database: company } }">
          {{ company }}
        </router-link>
      </li>
    </ul>
  </main>
  <ErrorView v-else />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ErrorView from './ErrorView.vue';

const route = useRoute();
const companies = computed(() =>
  String(route.query.companies || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
);
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.backLink {
  text-decoration: none;
  color: inherit;
}

ul {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
