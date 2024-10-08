<template>
  <div class="empty" v-if="loadingDone">
    <div class="searchField">
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        placeholder="Search"
        persistent-placeholder
        clearable
        rounded
      ></v-text-field>
      <v-btn
        :disabled="disableCompareButton"
        ariant="tonal"
        @click="sendToCompare"
        :style="'z-index: -999 !important;'"
      >
        {{ $t('buttonTekst.compare') }}
      </v-btn>
    </div>
    <v-data-table
      v-model="selectedItems"
      :headers="headers"
      :items="items"
      :search="search"
      @click:row="rowClick"
      :sticky="true"
      show-select
      return-object
      :items-per-page-options="[
        { value: 10, title: '10' },
        { value: 20, title: '25' },
        { value: 30, title: '30' },
        { value: 50, title: '50' }
      ]"
    ></v-data-table>
  </div>

  <div v-else class="loading">
    <LoadingCircle :linear="true" />
  </div>
</template>

<script lang="ts">
import '../../types/index';
import LoadingCircle from '../loadingCircle.vue';
import transformTime from '../../utils/Transforming/transformTime';

export default {
  components: {
    LoadingCircle
  },
  data(): gridTypes {
    return {
      selectedItems: [],
      search: '',
      items: [],
      loadingDone: false,
      clickedItem: {
        Company: ''
      },
      disableCompareButton: true,
      headers: [
        { title: this.$t('grid.1'), key: 'Company', sortable: true, width: '20%' },
        { title: this.$t('grid.2'), key: 'Date', sortable: true, width: '15%' },
        {
          title: this.$t('grid.3'),
          key: 'Total',
          sortable: true,
          width: '15%'
        },
        {
          title: this.$t('grid.4'),
          key: 'Correspondence',
          sortable: true,
          width: '10 %'
        },
        { title: this.$t('grid.5'), key: 'Overig', sortable: true, width: '10%' },
        { title: this.$t('grid.6'), key: 'Users', sortable: true, width: '10%' },
        { title: this.$t('grid.7'), key: 'Average', sortable: true, width: '15%' }
      ]
    };
  },
  watch: {
    selectedItems(val, oldVal) {
      if (val.length > 1) {
        this.disableCompareButton = false;
      } else this.disableCompareButton = true;
      if (val.length > 4) {
        this.$nextTick(() => {
          this.selectedItems = oldVal;
        });
      }
    }
  },
  props: {
    data: Object
  },
  methods: {
    async rowClick(clickEvent: any, rowData: any) {
      this.clickedItem = JSON.parse(JSON.stringify(await rowData.item));
      this.$router.push({
        name: 'database',
        params: { database: this.clickedItem.Company }
      });
    },
    async sendToCompare() {
      let compareRoute = '';
      for (let i = 0; i < this.selectedItems.length; i++) {
        compareRoute =
          compareRoute +
          `${i === this.selectedItems.length - 1 ? `${this.selectedItems[i].Company}` : `${this.selectedItems[i].Company}-`}`;
      }
      this.$router.push({
        name: 'database-compare',
        params: { databases: compareRoute }
      });
    },
    async tableData() {
      this.loadingDone = false;
      try {
        let pushDataInArray = async (data: any) => {
          let items = [];
          for (let i = 0; i < data?.length; i++) {
            items.push({
              Company: data[i].Source,
              Date: transformTime(data[i].BackupDate),
              Total: data[i].Sizes.Total,
              Correspondence: data[i].Sizes.CO,
              Overig: data[i].Sizes.Rest,
              Users: data[i].Sizes.ACT_US,
              Average: data[i].Average
            });
          }
          for (let i = 0; i < items.length; i++) {
            if (items[i].Company == undefined) {
              items.splice(i, 1);
            }
          }
          return items;
        };
        this.items = await pushDataInArray(this?.data);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  },
  async beforeMount() {
    this.items = [];
    this.loadingDone = false;
    this.loadingDone = await this.tableData();
  }
};
</script>

<style lang="scss" scoped>
@use '../../assets/sass/abstracts/variables.scss';

.empty,
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: calc(100vw - (map-get(variables.$padding, 'globalPadding') * 2));
  height: 100%;
}

.searchField {
  width: calc(35rem - (map-get(variables.$padding, 'globalPadding') * 2));
  padding-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 2rem;
  padding: 1 5rem;
}
</style>
