<template>
  <header class="header">
    <section class="header_wrap">
      <div class="brand">
        <span class="brand_mark" aria-hidden="true"></span>
        <div class="title">
          <div class="header_title">
            {{ $t('headerTitle') }}
          </div>
          <div class="header_subtitle">{{ $t('headerSubtitle') }}</div>
        </div>
      </div>
      <div class="filterSection" v-if="route.fullPath !== '/profile' && route.fullPath !== '/settings'">
        <div class="filterWrapper menu-activator" @click="open = !open">
          <v-btn :icon="open === true ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="x-small" variant="text"></v-btn>
          <span>{{ selectedDates[0] ? selectedDates[0] : $t('buttonTekst.filterText') }}</span>
          <span
            ><b>{{ !selectedDates[0] ? '' : '-' }}</b></span
          >
          <span>{{ selectedDates[0] ? selectedDates[selectedDates.length - 1] : '' }}</span>
        </div>
      </div>
      <div class="header_rightSide">
        <v-avatar size="40" id="profile_menu_opener" class="profile_picture" :image="user?.picture"></v-avatar>
      </div>
    </section>
  </header>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const auth0 = useAuth0();
const open = ref(false);
const user = ref(auth0.user);
const route = ref(useRoute());

const props = defineProps({
  updateChevron: {
    type: Number,
    required: true
  },
  selectedDates: {
    type: null as any,
    required: false
  }
});

watch(
  () => props.updateChevron,
  () => {
    toggleButton();
  }
);

const toggleButton = () => {
  open.value = !open.value;
};
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  background: var(--dm-header);
  height: 4.25rem;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 20;
  border-bottom: 3px solid var(--dm-accent);

  &_wrap {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  &_title {
    font-weight: 700;
    color: #f8fafc;
    font-size: 1.05rem;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  &_subtitle {
    color: #94a3b8;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &_rightSide {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &_mark {
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 0.45rem;
    background: linear-gradient(135deg, #14b8a6, #0f766e);
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
  }
}

.title {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.profile_picture {
  color: white;
  transition: 0.2s opacity ease;
  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
}

.filter {
  &Section {
    color: #e2e8f0;
  }

  &Wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.85rem;
  }
}

.menu-activator {
  &:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
