<template>
    <div class="site-plan-editor-map">
        <div
            id="site-plan-map"
            :style="{ width: '100%', height: '100%' }"
        ></div>
    </div>
</template>

<script>
import { map, CRS } from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { mapState, mapMutations, mapActions } from "vuex";
import useEditorLayer from "@/composables/useEditorLayer";

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
    setup() {
        const {
            initEmptyLayerProperties,
            setLayerStyle,
            addListeners,
            loadOverlayImage,
        } = useEditorLayer();

        return {
            initEmptyLayerProperties,
            setLayerStyle,
            addListeners,
            loadOverlayImage,
        };
    },
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
        }),
        async init() {
            await this.initMap();
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
    },
};
</script>

<style lang="scss"></style>
