<template>
  <div>
    <v-img
      class="mx-auto my-6"
      max-width="230"
      src="https://archie.myarchie.nl/app/img/login/default/default.png"
    ></v-img>
    <v-form @submit.prevent="handleSubmit()">
      <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="450" rounded="lg">
        <v-btn
          v-if="!isLoading"
          :disabled="loggingIn"
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
          type="submit"
          @click="login()"
        >
          {{ $t('buttonTekst.login') }}
        </v-btn>
      </v-card>
    </v-form>
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
.form {
  &_section {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-top: 5rem;
  }
  &_group {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    width: 100%;

    &_button {
      align-items: center;
    }
  }
  &_title {
    text-align: center;
  }
  &_label {
    font-size: 1.2rem;
  }
}

.invalid-feedback {
  color: red;
}

.is-invalid {
  border-color: red;
  color: red;
}
</style>
