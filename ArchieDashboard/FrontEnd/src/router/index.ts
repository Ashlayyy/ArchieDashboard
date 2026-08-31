import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@auth0/auth0-vue';

import HomeView from '../pages/HomeView.vue';
import DatabaseView from '../pages/DatabaseView.vue';
import LoginView from '../pages/loginView.vue';
import ProfileView from '../pages/ProfileView.vue';
import SettingsView from '../pages/SettingsView.vue';
import ErrorView from '../pages/ErrorView.vue';
import CompareView from '../pages/CompareView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: authGuard
    },
    {
      path: '/database/:database',
      name: 'database',
      component: DatabaseView,
      beforeEnter: authGuard
    },
    {
      path: '/compare',
      name: 'database-compare',
      component: CompareView,
      beforeEnter: authGuard
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: authGuard
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      beforeEnter: authGuard
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: ErrorView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    } else {
      window.scrollTo(0, 0);
    }
  }
});

export default router;
