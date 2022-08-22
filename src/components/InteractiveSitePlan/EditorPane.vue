<template>
    <div class="site-plan-editor-pane q-p-sm window-height">
        <!-- Toolbar -->
        <div class="tool-bar q-px-sm q-py-md">
            <div class="row justify-end q-mb-md">
                <q-btn
                    color="primary"
                    flat
                    class="q-mr-sm"
                    @click="openImportGeoJsonModal"
                    >Import GeoJSON</q-btn
                >
                <q-btn color="primary" @click="copyGeoJson"
                    >Export GeoJSON</q-btn
                >
            </div>
            <q-expansion-item
                dense-toggle
                expand-separator
                icon="fas fa-image"
                label="Image Upload"
                class="q-mb-md"
            >
                <q-uploader
                    color="primary"
                    flat
                    bordered
                    :multiple="false"
                    accept="image/*"
                    @added="imageAdded"
                    class="full-width q-pt-md"
                    label="Upload Image"
                />
            </q-expansion-item>

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
                                    <Unit :unit="item">
                                        <div class="row justify-end q-mt-sm">
                                            <q-btn
                                                v-if="layer"
                                                outline
                                                color="primary"
                                                @click="
                                                    setSelectedLayerUnitId(
                                                        item.id
                                                    )
                                                "
                                            >
                                                Assign
                                                <i
                                                    class="fas fa-chevron-right q-ml-sm"
                                                ></i>
                                            </q-btn>
                                        </div>
                                    </Unit>
                                </div>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </div>
            </div>
        </div>

        <!-- GeoJSON Import Modal -->
        <q-dialog v-model="importModal" persistent>
            <q-card style="min-width: 350px">
                <q-card-section>
                    <span class="text-h6">Import GeoJSON</span>
                </q-card-section>

                <q-card-section
                    class="q-pt-none scroll"
                    style="max-height: 50vh"
                >
                    <q-input
                        dense
                        outlined
                        v-model="geoJsonForImport"
                        type="textarea"
                    />
                </q-card-section>

                <q-separator />

                <q-card-actions align="right" class="text-primary q-pa-md">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                        color="primary"
                        unelevated
                        label="Import"
                        @click="loadEditorConfig"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import Unit from "@/components/Unit";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { useClipboard } from "@vueuse/core";
import useEditorLayer from "@/composables/useEditorLayer";
import { debounce } from "lodash";
import { useQuasar } from "quasar";
import { geoJSON } from "leaflet";

export default {
    setup() {
        const { copy } = useClipboard();
        const $q = useQuasar();
        const notify = function ({ message, color }) {
            $q.notify({
                message: message,
                color: color,
            });
        };

        const {
            initEmptyLayerProperties,
            setLayerStyle,
            addListeners,
            loadOverlayImage,
        } = useEditorLayer();

        return {
            copy,
            notify,
            initEmptyLayerProperties,
            setLayerStyle,
            addListeners,
            loadOverlayImage,
        };
    },
    components: {
        DynamicScroller,
        DynamicScrollerItem,
        Unit,
    },
    mixins: [],
    props: {},
    data: function () {
        return {
            importModal: false,
            geoJsonForImport: "",
        };
    },
    computed: {
        ...mapState({
            layer: (state) => state.sitePlanEditor?.selectedLayer,
            sitePlanMap: (state) => state.sitePlanEditor?.sitePlanMap,
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
        async copyGeoJson() {
            let geoJSON = await this.exportGeoJson();
            await this.copy(JSON.stringify(geoJSON, null, "\t"));
            this.notify({
                message: "GeoJSON has been copied to clipboard.",
                color: "#111",
            });
        },
        openImportGeoJsonModal() {
            this.importModal = true;
        },
        loadEditorConfig() {
            try {
                let parsed = JSON.parse(this.geoJsonForImport);
                let importedGeoJSON = geoJSON(parsed, {
                    onEachFeature: (feature, layer) => {
                        this.addListeners(layer);
                        this.setLayerStyle(layer);
                        this.initEmptyLayerProperties(layer);
                    },
                });
                importedGeoJSON.addTo(this.sitePlanMap);
                this.importModal = false;
                this.notify({
                    message: "GeoJSON imported successfully",
                    color: "positive",
                });
            } catch (error) {
                this.notify({
                    message: "Something went wrong with the importing.",
                    color: "negative",
                });
            }
        },
    },
};
</script>

<style lang="scss">
.site-plan-editor-pane {
    display: flex;
    flex-direction: column;
    border-left: solid 1px #ddd;
    overflow: hidden;
    .tool-bar {
        border-bottom: solid 1px #ddd;
    }
    .unit-list {
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 8px;
            padding-left: 4px;
            padding-right: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: darkgrey;
            border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
            padding: 8px;
        }

        .unit {
            border-bottom: solid 1px #ddd;
        }
    }
}
</style>
