<template>
  <div class="project-interactive-site-plan-editor--selected-unit">
    <UnitSummary
      v-if="selectedUnit"
      class="selected-unit"
      :unit="selectedUnit"
      compact
      isCollapsible
    >
      <template #top-right>
        <dropdown-button class="ml-1">
          <template #buttonContent>
            <i class="fas fa-ellipsis-v"></i>
          </template>
          <div class="card">
            <list-item @click="editStatus(selectedUnit)">
              <i class="fas fa-edit mr-1"></i>
              Edit Status
            </list-item>
            <list-item @click="editPrice(selectedUnit)">
              <i class="fas fa-pen mr-1"></i>
              Edit Price
            </list-item>
          </div>
        </dropdown-button>
      </template>
      <template #bottom>
        <fd-button
          class="bordered danger mt-1"
          @click="removeSelectedLayerUnitId()"
        >
          <i class="fas fa-trash-can mr-1"></i> Remove
        </fd-button>
      </template>
    </UnitSummary>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  components: {
    UnitSummary: () => import("@/modules/Project/components/Unit/UnitSummary"),
    DropdownButton: () =>
      import("@/components/GlobalComponents/DropdownButton"),
    ListItem: () => import("@/components/GlobalComponents/List/FdListItem")
  },
  mixins: [],
  props: {},
  data: function () {
    return {};
  },
  computed: {
    ...mapGetters({
      selectedUnit: "sitePlanEditor/getSelectedLayerUnit"
    })
  },
  watch: {},
  created: function () {},
  beforeDestroy: function () {},
  mounted: function () {},
  methods: {
    ...mapMutations({
      removeSelectedLayerUnitId: "sitePlanEditor/removeSelectedLayerUnitId",
      setChangeStatusModalShown: "sitePlanEditor/setChangeStatusModalShown",
      setChangeStatusModalUnit: "sitePlanEditor/setChangeStatusModalUnit",
      setChangePriceModalShown: "sitePlanEditor/setChangePriceModalShown",
      setChangePriceModalUnit: "sitePlanEditor/setChangePriceModalUnit"
    }),
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
.project-interactive-site-plan-editor--selected-unit {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 350px;
  box-shadow: 0 0 5px #00000025;
  border-radius: 8px;
  background: white;
}
</style>
