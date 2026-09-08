<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-brand">
        <span class="login-mark" aria-hidden="true"></span>
        <h1>DataMetrics</h1>
        <p>{{ $t('loginTagline') }}</p>
      </div>
      <v-form @submit.prevent="handleSubmit()">
        <v-btn
          v-if="!isLoading"
          :disabled="loggingIn"
          class="login-button"
          color="#0f766e"
          size="large"
          variant="flat"
          block
          type="submit"
          @click="login()"
        >
          {{ $t('buttonTekst.login') }}
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

const auth0 = useAuth0();
const { loginWithRedirect } = useAuth0();

const loggingIn = ref(false);
const isLoading = ref(auth0.isLoading);

const handleSubmit = () => {
  loggingIn.value = true;
};

const login = () => {
  loginWithRedirect();
};
</script>
<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(20, 184, 166, 0.28), transparent 38%),
    radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.18), transparent 42%),
    #eef2f7;
}

.login-panel {
  width: min(420px, 100%);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.login-brand {
  text-align: center;
  margin-bottom: 1.75rem;

  h1 {
    margin: 0.9rem 0 0.35rem;
    font-size: 1.8rem;
    letter-spacing: -0.04em;
    color: #0f172a;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
  }
}

.login-mark {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.28);
}

.login-button {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
}
</style>
