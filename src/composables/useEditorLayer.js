import { useStore } from "vuex";
import { getPolygonStyleByStatus } from "@/store/sitePlanEditor";
import { computed, unref } from "vue";

export default function useEditorLayer() {
    const store = useStore();

    function applyImageToMap() {
        return store.dispatch("sitePlanEditor/applyImageToMap");
    }

    function setSitePlanImage(val) {
        return store.commit("sitePlanEditor/setSitePlanImage", val);
    }

    const units = computed(() => store.state.sitePlanEditor?.units);
    const selectedLayer = computed(
        () => store.state.sitePlanEditor?.selectedLayer
    );

    function initEmptyLayerProperties(layer) {
        if (
            Array.isArray(layer.feature.properties) &&
            layer.feature.properties.length < 1
        ) {
            layer.feature.properties = {};
        }
    }

    function addListeners(layer) {
        layer.on("click", () => {
            // Deselect current selected layer
            if (unref(selectedLayer)) setLayerStyle(unref(selectedLayer));
            // Select Layer
            layer.setStyle({
                color: "#3388ff",
                fillOpacity: "0.8",
                fill: true,
            });
            store.commit("sitePlanEditor/selectLayer", layer);
        });
    }
    function loadOverlayImage(image) {
        setSitePlanImage(image);
        applyImageToMap();
    }
    function setLayerStyle(layer) {
        let unitId = layer?.feature?.properties?.unitId;
        let unit = units.value.find((unit) => unit.id == unitId);
        let style = getPolygonStyleByStatus(unit?.status);
        layer.setStyle(style);
    }

    return {
        initEmptyLayerProperties,
        setLayerStyle,
        addListeners,
        loadOverlayImage,
    };
}
