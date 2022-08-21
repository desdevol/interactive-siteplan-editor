<template>
    <div class="site-plan-editor-map">
        <div
            id="site-plan-map"
            :style="{ width: '100%', height: '100%' }"
        ></div>
    </div>
</template>

<script>
import { map, geoJSON, CRS } from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { mapState, mapMutations, mapActions } from "vuex";
import { getPolygonStyleByStatus } from "@/store/sitePlanEditor";

const mapConfig = {
    crs: CRS.Simple,
    minZoom: 0,
    attributionControl: false,
};
const geomanControlConfig = {
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawCircle: false,
    drawText: false,
};

export default {
    components: {},
    mixins: [],
    props: {},
    data: function () {
        return {
            imageURL: "",
        };
    },
    computed: {
        ...mapState({
            layer: (state) => state.sitePlanEditor?.selectedLayer,
            sitePlanMap: (state) => state.sitePlanEditor?.sitePlanMap,
            editorMode: (state) => state.sitePlanEditor?.mode,
            existingSitePlan: (state) => state.sitePlanEditor?.existingSitePlan,
            units: (state) => state.sitePlanEditor?.units,
        }),
    },
    watch: {},
    created: function () {},
    beforeUnmount: function () {},
    mounted: function () {
        this.init();
    },
    methods: {
        ...mapMutations({
            setSelectedLayerStyle: "sitePlanEditor/setSelectedLayerStyle",
            setSitePlanMap: "sitePlanEditor/setSitePlanMap",
            setSitePlanImage: "sitePlanEditor/setSitePlanImage",
        }),
        ...mapActions({
            applyImageToMap: "sitePlanEditor/applyImageToMap",
            initUnits: "sitePlanEditor/initUnits",
        }),
        async init() {
            await this.initMap();
            await this.initUnits();
            if (this.editorMode == "edit") {
                this.loadOverlayImage(this.existingSitePlan.image);
                this.loadEditorConfig(this.existingSitePlan.geoJson);
            }
        },
        async initMap() {
            // Create map instance
            this.setSitePlanMap(map("site-plan-map", mapConfig));

            // Add Controls
            this.sitePlanMap.pm.addControls(geomanControlConfig);

            // Create a listener for creations
            this.sitePlanMap.on("pm:create", ({ layer }) => {
                layer.setStyle({ color: "#3388ff" });
                this.addFeatures(layer);
                this.addListeners(layer);
            });
        },

        addFeatures(layer) {
            let feature = (layer.feature = layer.feature || {});
            feature.properties = feature.properties || {}; // Intialize feature.properties
            feature.type = feature.type || "Feature"; // Intialize feature.type
        },
        addListeners(layer) {
            layer.on("click", () => {
                // Deselect current selected layer
                if (this.layer) this.setLayerStyle(this.layer);
                // Select Layer
                layer.setStyle({
                    color: "#3388ff",
                    fillOpacity: "0.8",
                    fill: true,
                });
                this.$store.commit("sitePlanEditor/selectLayer", layer);
            });
        },
        loadOverlayImage(image) {
            this.setSitePlanImage(image);
            this.applyImageToMap();
        },
        loadEditorConfig(geoJson) {
            let importedGeoJSON = geoJSON(geoJson, {
                onEachFeature: (feature, layer) => {
                    this.addListeners(layer);
                    this.setLayerStyle(layer);
                    this.initEmptyLayerProperties(layer);
                },
            });
            importedGeoJSON.addTo(this.sitePlanMap);
        },
        setLayerStyle(layer) {
            let unitId = layer?.feature?.properties?.unitId;
            let unit = this.units.find((unit) => unit.id == unitId);
            let style = getPolygonStyleByStatus(unit?.status);
            layer.setStyle(style);
        },
        initEmptyLayerProperties(layer) {
            if (
                Array.isArray(layer.feature.properties) &&
                layer.feature.properties.length < 1
            ) {
                layer.feature.properties = {};
            }
        },
    },
};
</script>

<style lang="scss"></style>
