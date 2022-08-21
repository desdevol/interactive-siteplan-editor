import Fuse from "fuse.js";
import { cloneDeep, isEmpty } from "lodash";
import { imageOverlay, LatLngBounds, LatLng } from "leaflet";
import { status as STATUS } from "@/enums";
import mockUnit from "@/misc/mock_unit.json";
const collator = new Intl.Collator([], { numeric: true });
const sortByPlot = (a, b) => collator.compare(a.plot, b.plot);

function getBounds(w, h) {
    let x;
    let y;

    if (w / 2 >= h) {
        x = 180;

        y = h * (x / w);
    } else if (h > w || w / 2 < h) {
        y = 90;

        x = w * (y / h);
    }

    let c1 = new LatLng(-y, -x);
    let c2 = new LatLng(y, x);

    return new LatLngBounds(c1, c2);
}

function getImageDimensions(imageURL) {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = imageURL;
    });
}

export function getPolygonStyleByStatus(status) {
    switch (status) {
        case STATUS.ACTIVE:
            return { color: "green", fillOpacity: "0.2" };
        case STATUS.SOLD:
            return { color: "red", fillOpacity: "0.2" };
        case STATUS.INACTIVE:
            return { color: "grey", fillOpacity: "0.2" };
        default:
            return { color: "#3388ff", fillOpacity: "0.2" };
    }
}

export default {
    namespaced: true,
    state: () => ({
        selectedLayer: null,
        sitePlanMap: null,
        sitePlanImage:
            "https://storage.googleapis.com/proudcity/sanrafaelca/uploads/2020/05/Site-plan2-scaled-e1588519997958.jpg",
        existingSitePlan: null,
        mapOverlay: null,

        unitTypeId: "",

        units: [],
        unitPagination: {
            total: 1,
            page: 1,
        },
        unitFilter: {
            plot: "",
        },
        isUnitListInitializing: false,
        changeStatusModal: {
            isShown: false,
            unit: null,
        },
        changePriceModal: {
            isShown: false,
            unit: null,
        },

        mode: "create",
        projectUnitTypeAPI: null,
    }),
    getters: {
        getSelectedLayer(state) {
            return state.selectedLayer;
        },
        getFilteredUnits(state, getters) {
            if (isEmpty(state.unitFilter["plot"])) {
                return state.units
                    .filter(
                        (unit) => unit.id != getters.getSelectedLayerUnit?.id
                    )
                    .sort(sortByPlot);
            } else {
                const fuse = new Fuse(state.units, {
                    keys: ["plot", "street"],
                });
                let searchResult = fuse.search(state.unitFilter["plot"]);
                return searchResult
                    .map((result) => result.item)
                    .sort(sortByPlot);
            }
        },
        getSelectedLayerUnit(state) {
            let selecetedUnitId =
                state.selectedLayer?.feature?.properties?.unitId;
            let unit =
                state.units.find((unit) => unit.id == selecetedUnitId) || null;

            return unit;
        },
    },
    mutations: {
        setMode(state, mode) {
            state.mode = mode;
        },
        // Site Plan
        setSitePlanMap(state, lMap) {
            state.sitePlanMap = lMap;
        },
        setSitePlanImage(state, image) {
            state.sitePlanImage = image;
        },
        setExistingSitePlan(state, sitePlan) {
            state.existingSitePlan = sitePlan;
        },
        selectLayer(state, layer) {
            state.selectedLayer = layer;
        },
        setSelectedLayerStyle(state, style) {
            if (state.selectedLayer) {
                state.selectedLayer.setStyle(style);
            }
        },
        setSelectedLayerUnitId(state, unitId) {
            if (state.selectedLayer) {
                this._vm.$set(
                    state.selectedLayer.feature.properties,
                    "unitId",
                    unitId
                );
            }
        },
        removeSelectedLayerUnitId(state) {
            if (state.selectedLayer) {
                state.selectedLayer.feature.properties = {};
            }
        },

        // Unit
        setUnitTypeId(state, id) {
            state.unitTypeId = id;
        },
        setUnits(state, res) {
            state.units = [...state.units, ...cloneDeep(res.data)];
            state.unitPagination.total = res.meta.pagination.total_pages;
        },
        incrementUnitPagination(state) {
            state.unitPagination.page++;
        },
        setUnitListInitializing(state, bool) {
            state.isUnitListInitializing = bool;
        },
        setPlotSearch(state, val) {
            state.unitFilter["plot"] = val;
        },
        setUnitInList(state, unit) {
            let unitId = unit.id;
            let index = state.units.findIndex((unit) => unit.id == unitId);

            if (index !== null) {
                state.units.splice(index, 1, unit);
                state.sitePlanMap.eachLayer((layer) => {
                    if (layer.feature?.properties?.unitId == unit.id) {
                        layer.setStyle(getPolygonStyleByStatus(unit.status));
                    }
                });
            }
        },
    },
    actions: {
        // ================================ UNIT ===============================
        getUnits({ commit, state }) {
            commit("setUnitListInitializing", true);
            state.units = mockUnit;
            commit("setUnitListInitializing", false);
        },
        // ================================ MAP ================================
        async applyImageToMap({ state }) {
            if (state.mapOverlay) {
                state.sitePlanMap.removeLayer(state.mapOverlay);
                state.mapOverlay = null;
            }

            const imageURL = state.sitePlanImage;
            // Get image dimensions & set bounds
            const { width, height } = await getImageDimensions(imageURL);
            const bounds = getBounds(width, height);
            state.sitePlanMap.setMaxBounds(bounds);
            state.sitePlanMap.fitBounds(bounds);

            // Add Image Overlay
            state.mapOverlay = imageOverlay(imageURL, bounds);
            state.mapOverlay.addTo(state.sitePlanMap);
            let center = state.mapOverlay.getCenter();
            state.sitePlanMap.panTo(center);
        },

        getGeoJson({ state }) {
            let geoJson = state.sitePlanMap.pm
                .getGeomanLayers(true)
                .toGeoJSON();

            return geoJson;
        },
    },
};
