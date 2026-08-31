import 'vuetify/styles';
import './assets/sass/Archie_Dashboard.scss';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { createNotivue } from 'notivue';
import { createAuth0 } from '@auth0/auth0-vue';
import { createVuestic } from 'vuestic-ui';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import en from './locales/en';
import nl from './locales/nl';

import App from './App.vue';
import router from './router';

import 'notivue/notification.css';
import 'notivue/animations.css';
import 'notivue/notification-progress.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vuestic-ui/css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler
);

const app = createApp(App);

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'nl',
  fallbackLocale: 'nl',
  messages: { en, nl }
});

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi'
  }
});

const notivue = createNotivue({
  pauseOnTabChange: false,
  position: 'top-right',
  limit: 2,
  enqueue: true,
  notifications: {
    global: {
      duration: 3000
    }
  }
});

app.use(router);

app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH_DOMAIN,
    clientId: import.meta.env.VITE_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(import.meta.env.VITE_AUTH0_AUDIENCE
        ? { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
        : {})
    }
  })
);

app.use(createVuestic());
app.use(createPinia());
app.use(vuetify);
app.use(i18n);
app.use(notivue);

app.mount('#app');
