<template>
    <div class="site-plan-editor-pane q-p-sm">
        <!-- Toolbar -->
        <div class="tool-bar q-px-sm q-py-md">
            <div class="row justify-end q-mb-md">
                <q-btn color="primary">Export GeoJSON</q-btn>
            </div>

            <q-uploader
                color="primary"
                flat
                bordered
                :multiple="false"
                accept="image/*"
                @added="imageAdded"
                class="full-width q-mb-md"
                label="Upload Image"
            />

            <div class="row nowrap">
                <q-input
                    v-model="plotSearch"
                    name="plotSearch"
                    label="Plot/Street"
                    outlined
                    type="text"
                    class="q-mb-md full-width"
                    clearable
                >
                    <template v-slot:prepend>
                        <q-icon name="fas fa-search" />
                    </template>
                </q-input>
            </div>
        </div>
        <!-- Units -->
        <div class="unit-list">
            <div
                v-if="isUnitListInitializing"
                class="row justify-center align-center"
                :style="{ height: '100px' }"
            >
                Fetching Units...
            </div>
            <div v-else>
                <div v-if="filteredUnits.length < 1">
                    <div class="text-h5 text-center q-my-lg">
                        No units available
                    </div>
                </div>
                <div v-else>
                    <DynamicScroller
                        :items="filteredUnits"
                        :min-item-size="200"
                    >
                        <template v-slot="{ item, active }">
                            <DynamicScrollerItem
                                :item="item"
                                :active="active"
                                :data-index="item.id"
                                class="px-2"
                            >
                                <div class="unit q-p-xs">
                                    {{ item.plot }}
                                    {{ item.street }}
                                </div>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { debounce } from "lodash";

export default {
    setup() {
        const geoJSON = ref("");
        const { copy } = useClipboard({ geoJSON });

        return { geoJSON, copy };
    },
    components: {
        DynamicScroller,
        DynamicScrollerItem,
    },
    mixins: [],
    props: {},
    data: function () {
        return {};
    },
    computed: {
        ...mapState({
            layer: (state) => state.sitePlanEditor?.selectedLayer,
            units: (state) => state.sitePlanEditor?.units,
            isUnitListInitializing: (state) =>
                state.sitePlanEditor?.isUnitListInitializing,
        }),
        ...mapGetters({
            filteredUnits: "sitePlanEditor/getFilteredUnits",
            selectedUnit: "sitePlanEditor/getSelectedLayerUnit",
        }),
        plotSearch: {
            get() {
                return this.$store.state.sitePlanEditor?.unitFilter["plot"];
            },
            set: debounce(function (val) {
                this.$store.commit("sitePlanEditor/setPlotSearch", val);
            }, 300),
        },
        sitePlanImage: {
            get() {
                return this.$store.state.sitePlanEditor?.sitePlanImage;
            },
            set(val) {
                this.$store.commit("sitePlanEditor/setSitePlanImage", val);
            },
        },
    },
    watch: {},
    created: function () {},
    beforeUnmount: function () {},
    mounted: function () {
        this.getUnits();
    },
    methods: {
        ...mapActions({
            exportGeoJson: "sitePlanEditor/getGeoJson",
            loadNextUnits: "sitePlanEditor/loadNextUnits",
            applyImageToMap: "sitePlanEditor/applyImageToMap",
            getUnits: "sitePlanEditor/getUnits",
        }),
        ...mapMutations({
            setSelectedLayerUnitId: "sitePlanEditor/setSelectedLayerUnitId",
        }),
        imageAdded(files) {
            let url = URL.createObjectURL(files[0]);
            this.sitePlanImage = url;
            this.applyImageToMap();
        },
    },
};
</script>

<style lang="scss">
.site-plan-editor-pane {
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
