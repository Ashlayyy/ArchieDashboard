<template>
  <section>
    <h1>Not Found!</h1>
    <p>
      <router-link to="/">Go home?</router-link>
    </p>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: 'NotFound',
  components: { RouterLink }
};
</script>

<style scoped>
section {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  gap: 1rem;
}

h1 {
  color: var(--border);
  font-size: 2em;
}
</style>
