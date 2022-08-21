<template>
  <div class="project-site-plan-editor-pane p-1">
    <!-- Toolbar -->
    <div class="tool-bar px-1 py-2">
      <fd-button
        class="main mb-2"
        :icon="imageUploader.isShown ? 'fas fa-minus' : 'fas fa-plus'"
        @click="toggleImageUploader"
      >
        Upload Site Plan
      </fd-button>
      <transition name="fade">
        <div v-show="imageUploader.isShown" class="col-12 mb-3">
          <image-uploader
            v-model="sitePlanImage"
            :multiple="false"
            imgWrapperClass="col-6"
            :maxSize="100"
            @added="applyImageToMap"
          >
          </image-uploader>
        </div>
      </transition>

      <div class="d-flex">
        <fd-input
          v-model="plotSearch"
          name="plotSearch"
          placeholder="Search Plot/Street"
          type="text"
          class="mb-2"
          :style="{ flexGrow: 1 }"
        >
        </fd-input>
        <fd-button
          @click="plotSearch = ''"
          class="ml-1"
          :style="{ height: 'fit-content' }"
        >
          <i class="fas fa-times"></i>
        </fd-button>
      </div>

      <div
        v-if="layer && !selectedUnit"
        class="p-2"
        :style="{ border: 'solid 1px #ddd', borderRadius: '5px' }"
      >
        <p>
          <span class="font-bold d-block mb-1">Not Assigned</span>
          This area has not been assigned to any unit yet. Please select a unit
          from the list to set to this area.
        </p>
      </div>
    </div>
    <!-- Units -->
    <div class="unit-list">
      <div
        v-if="isUnitListInitializing"
        class="d-flex justify-content-center align-items-center"
        :style="{ height: '100px' }"
      >
        Fetching Units...
      </div>
      <div v-else>
        <div v-if="filteredUnits.length < 1">
          <NoData imgSize="120px" message="No units available"></NoData>
        </div>
        <div v-else>
          <DynamicScroller :items="filteredUnits" :min-item-size="200">
            <template v-slot="{ item, active }">
              <DynamicScrollerItem
                :item="item"
                :active="active"
                :data-index="item.id"
                class="px-2"
              >
                <div class="unit p-1">
                  <UnitSummary :unit="item">
                    <template #top-right>
                      <dropdown-button class="ml-1">
                        <template #buttonContent>
                          <i class="fas fa-ellipsis-v"></i>
                        </template>
                        <div class="card">
                          <list-item @click="editStatus(item)">
                            <i class="fas fa-edit mr-1"></i>
                            Edit Status
                          </list-item>
                          <list-item @click="editPrice(item)">
                            <i class="fas fa-pen mr-1"></i>
                            Edit Price
                          </list-item>
                        </div>
                      </dropdown-button>
                    </template>
                    <template #bottom>
                      <fd-button
                        v-if="layer"
                        class="main mt-2"
                        @click="setSelectedLayerUnitId(item.id)"
                      >
                        <i class="fas fa-square-arrow-up-right mr-1"></i>
                        Set to Area
                      </fd-button>
                    </template>
                  </UnitSummary>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
          <InfiniteLoading @infinite="loadNextUnits">
            <span slot="no-more"></span>
          </InfiniteLoading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import InfiniteLoading from "vue-infinite-loading";

export default {
  components: {
    DynamicScroller,
    DynamicScrollerItem,
    InfiniteLoading,
    NoData: () => import("@/components/GlobalComponents/NoData/NoData"),
    UnitSummary: () => import("@/modules/Project/components/Unit/UnitSummary"),
    DropdownButton: () =>
      import("@/components/GlobalComponents/DropdownButton"),
    ListItem: () => import("@/components/GlobalComponents/List/FdListItem"),
    ImageUploader: () => import("@/components/GlobalComponents/ImageUploader")
  },
  mixins: [],
  props: {},
  data: function () {
    return {
      imageUploader: {
        isShown: false
      }
    };
  },
  computed: {
    ...mapState({
      layer: (state) => state.sitePlanEditor?.selectedLayer,
      units: (state) => state.sitePlanEditor?.units,
      isUnitListInitializing: (state) =>
        state.sitePlanEditor?.isUnitListInitializing
    }),
    ...mapGetters({
      filteredUnits: "sitePlanEditor/getFilteredUnits",
      selectedUnit: "sitePlanEditor/getSelectedLayerUnit"
    }),
    plotSearch: {
      get() {
        return this.$store.state.sitePlanEditor?.unitFilter["plot[partial]"];
      },
      set(val) {
        this.$store.commit("sitePlanEditor/setPlotSearch", val);
      }
    },
    sitePlanImage: {
      get() {
        return this.$store.state.sitePlanEditor?.sitePlanImage;
      },
      set(val) {
        this.$store.commit("sitePlanEditor/setSitePlanImage", val);
      }
    }
  },
  watch: {},
  created: function () {},
  beforeDestroy: function () {},
  mounted: function () {},
  methods: {
    ...mapActions({
      exportGeoJson: "sitePlanEditor/getGeoJson",
      loadNextUnits: "sitePlanEditor/loadNextUnits",
      applyImageToMap: "sitePlanEditor/applyImageToMap"
    }),
    ...mapMutations({
      setSelectedLayerUnitId: "sitePlanEditor/setSelectedLayerUnitId",
      setChangeStatusModalShown: "sitePlanEditor/setChangeStatusModalShown",
      setChangeStatusModalUnit: "sitePlanEditor/setChangeStatusModalUnit",
      setChangePriceModalShown: "sitePlanEditor/setChangePriceModalShown",
      setChangePriceModalUnit: "sitePlanEditor/setChangePriceModalUnit"
    }),
    toggleImageUploader() {
      this.imageUploader.isShown = !this.imageUploader.isShown;
    },
    editStatus(unit) {
      this.setChangeStatusModalUnit(unit);
      this.setChangeStatusModalShown(true);
    },
    editPrice(unit) {
      this.setChangePriceModalUnit(unit);
      this.setChangePriceModalShown(true);
    }
  }
};
</script>

<style lang="scss">
.project-site-plan-editor-pane {
  display: flex;
  flex-direction: column;
  border-left: solid 1px #ddd;
  height: 100%;
  overflow: hidden;
  .tool-bar {
    border-bottom: solid 1px #ddd;
  }
  .unit-list {
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
      padding-left: 2px;
      padding-right: 2px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: darkgrey;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      padding: 5px;
    }

    .unit {
      border-bottom: solid 1px #ddd;
    }
  }
}
</style>
