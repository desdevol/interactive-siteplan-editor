<template>
  <div class="project-interactive-site-plan-editor">
    <modal-content>
      <template #body>
        <div class="d-flex h-100">
          <div
            class="col-9"
            :style="{ display: 'flex', flexDirection: 'column' }"
          >
            <div class="d-flex justify-content-between p-2">
              <div :style="{ flexGrow: 1 }">
                <h2>Siteplan Editor</h2>
                <slot name="title"></slot>
              </div>
              <a
                href="https://youtu.be/eI7TheCabsU"
                target="_blank"
                class="btn circle d-flex align-items-center justify-content-center ml-2"
                ><i class="fas fa-question"></i
              ></a>
            </div>
            <editor-map class="h-100"></editor-map>
            <div :style="{ position: 'relative', zIndex: 401 }">
              <editor-selected-unit></editor-selected-unit>
            </div>
            <div class="d-flex justify-content-end p-2">
              <fd-button class="medium" @click="$emit('close')"
                >Close</fd-button
              >
              <fd-button
                class="medium main ml-2"
                @click="saveSitePlan"
                :disabled="!hasSitePlanImage"
              >
                Save
              </fd-button>
            </div>
          </div>
          <editor-pane class="col-3"></editor-pane>
        </div>
      </template>
    </modal-content>
    <!-- ====================== Modal: Change Status ======================= -->
    <modal class="editor-nested-modal" v-model="isChangeStatusShown" isNested>
      <change-unit-status
        :unit="changeStatusModal.unit"
        @cancel="setChangeStatusModalShown(false)"
        @submit="changeUnitStatus"
      ></change-unit-status>
    </modal>
    <!-- ====================== Modal: Change Price ======================= -->
    <modal class="editor-nested-modal" v-model="isChangePriceShown" isNested>
      <change-unit-price
        :unit="changePriceModal.unit"
        @cancel="setChangePriceModalShown(false)"
        @submit="changeUnitPrice"
      ></change-unit-price>
    </modal>
  </div>
</template>

<script>
import ModalContent from "@/components/GlobalComponents/ModalBox/ModalContent";
import sitePlanEditor from "@/modules/Project/store/sitePlanEditor";
import ManagerRole from "@/modules/Project/classes/ManagerRoles";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  components: {
    ModalContent,
    EditorMap: () => import("./EditorMap"),
    EditorPane: () => import("./EditorPane"),
    EditorSelectedUnit: () => import("./EditorSelectedUnit"),
    ChangeUnitStatus: () =>
      import("@/modules/Project/components/Unit/ChangeUnitStatus"),
    ChangeUnitPrice: () =>
      import("@/modules/Project/components/Unit/ChangeUnitPrice")
  },
  mixins: [],
  props: {
    role: {
      type: String,
      default: ManagerRole.AGENCY,
      validator: (val) => new ManagerRole().getRoles().includes(val)
    },
    mode: {
      type: String,
      default: "create",
      validator: (val) => ["create", "edit"].includes(val)
    },
    unitTypeId: {
      type: [String, Number],
      required: true
    },
    sitePlan: {
      type: Object
    }
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState({
      changeStatusModal: (state) => state.sitePlanEditor?.changeStatusModal,
      changePriceModal: (state) => state.sitePlanEditor?.changePriceModal
    }),
    hasSitePlanImage() {
      return this.$store.state.sitePlanEditor?.sitePlanImage.length > 0;
    },
    isChangeStatusShown: {
      get() {
        return this.changeStatusModal.isShown;
      },
      set(val) {
        this.setChangeStatusModalShown(val);
      }
    },
    isChangePriceShown: {
      get() {
        return this.changePriceModal.isShown;
      },
      set(val) {
        this.setChangePriceModalShown(val);
      }
    }
  },
  watch: {},
  created: function () {
    this.$store.registerModule("sitePlanEditor", sitePlanEditor);
    this.$store.commit("sitePlanEditor/setMode", this.mode);
    this.$store.commit("sitePlanEditor/initAPI", this.role);
    this.$store.commit("sitePlanEditor/setUnitTypeId", this.unitTypeId);
    if (this.mode == "edit") {
      this.$store.commit("sitePlanEditor/setExistingSitePlan", this.sitePlan);
    }
  },
  beforeDestroy: function () {
    this.$store.unregisterModule("sitePlanEditor");
  },
  mounted: function () {},
  methods: {
    ...mapMutations({
      setChangeStatusModalShown: "sitePlanEditor/setChangeStatusModalShown",
      setChangePriceModalShown: "sitePlanEditor/setChangePriceModalShown"
    }),
    ...mapActions({
      createUnitTypeSitePlan: "sitePlanEditor/createUnitTypeSitePlan",
      updateUnitTypeSitePlan: "sitePlanEditor/updateUnitTypeSitePlan",
      updateUnitStatus: "sitePlanEditor/updateUnitStatus",
      updateUnitPrice: "sitePlanEditor/updateUnitPrice"
    }),
    async saveSitePlan() {
      if (this.mode == "create") {
        await this.createUnitTypeSitePlan();
        this.$emit("created");
        this.$emit("close");
      } else if (this.mode == "edit") {
        await this.updateUnitTypeSitePlan();
        this.$emit("updated");
        this.$emit("close");
      }
    },
    async changeUnitStatus(id, payload) {
      await this.updateUnitStatus({ id, payload });
    },
    async changeUnitPrice(id, payload) {
      await this.updateUnitPrice({ id, payload });
    }
  }
};
</script>

<style lang="scss">
.project-interactive-site-plan-editor {
  .editor-nested-modal {
    .fd-modal__overlay {
      z-index: 1001;
    }
  }
}
</style>
