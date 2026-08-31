<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import NotificationHolder from './components/NotificationHolder.vue';
import HomeViewLayout from './layouts/HomeViewLayout.vue';
import { setAccessTokenGetter } from './services/accessToken';

const { getAccessTokenSilently, isAuthenticated } = useAuth0();

setAccessTokenGetter(async () => {
  if (!isAuthenticated.value) {
    return undefined;
  }
  try {
    return await getAccessTokenSilently();
  } catch {
    return undefined;
  }
});
</script>

<template>
  <NotificationHolder />
  <HomeViewLayout>
    <template #content>
      <RouterView :key="$route.fullPath" />
    </template>
  </HomeViewLayout>
</template>

<style scoped></style>
