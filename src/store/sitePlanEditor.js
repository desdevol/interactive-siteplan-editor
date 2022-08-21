import ProjectUnitAPI from "@/modules/Project/api/projectUnit";
import ProjectUnitTypeAPI from "@/modules/Project/api/projectUnitType";
import ManagerRole from "@/modules/Project/classes/ManagerRoles";
import UnitTypeModel from "@/modules/Project/models/ProjectUnitTypeModel";

import Fuse from "fuse.js";
import { cloneDeep, isEmpty } from "lodash";
import { getFileURL } from "@/utils/url";
import { imageOverlay, LatLngBounds, LatLng } from "leaflet";
import { projectUnitStatus } from "@/enums";

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
        case projectUnitStatus.ACTIVE:
            return { color: "green", fillOpacity: "0.2" };
        case projectUnitStatus.SOLD:
            return { color: "red", fillOpacity: "0.2" };
        case projectUnitStatus.INACTIVE:
        case projectUnitStatus.BOOKED:
        case projectUnitStatus.RESERVATION:
        case projectUnitStatus.DELETED:
        case projectUnitStatus.CONFIRMED:
        case projectUnitStatus.CLOSED:
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
        sitePlanImage: [],
        existingSitePlan: null,
        mapOverlay: null,

        unitTypeId: "",

        units: [],
        unitPagination: {
            total: 1,
            page: 1
        },
        unitFilter: {
            "plot[partial]": ""
        },
        isUnitListInitializing: false,
        changeStatusModal: {
            isShown: false,
            unit: null
        },
        changePriceModal: {
            isShown: false,
            unit: null
        },

        role: ManagerRole.AGENCY,
        mode: "create",
        projectUnitAPI: null,
        projectUnitTypeAPI: null
    }),
    getters: {
        getSelectedLayer(state) {
            return state.selectedLayer;
        },
        getFilteredUnits(state, getters) {
            if (isEmpty(state.unitFilter["plot[partial]"])) {
                return state.units
                    .filter(
                        (unit) => unit.id != getters.getSelectedLayerUnit?.id
                    )
                    .sort(sortByPlot);
            } else {
                const fuse = new Fuse(state.units, {
                    keys: ["plot", "street"]
                });
                let searchResult = fuse.search(
                    state.unitFilter["plot[partial]"]
                );
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
        }
    },
    mutations: {
        initAPI(state, role) {
            state.projectUnitAPI = new ProjectUnitAPI(role);
            state.projectUnitTypeAPI = new ProjectUnitTypeAPI(role);
        },
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
            state.unitFilter["plot[partial]"] = val;
        },
        setChangeStatusModalShown(state, bool) {
            state.changeStatusModal.isShown = bool;
        },
        setChangeStatusModalUnit(state, unit) {
            state.changeStatusModal.unit = unit;
        },
        setChangePriceModalShown(state, bool) {
            state.changePriceModal.isShown = bool;
        },
        setChangePriceModalUnit(state, unit) {
            state.changePriceModal.unit = unit;
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
        }
    },
    actions: {
        // ================================ UNIT ===============================
        async initUnits({ commit, state, dispatch }) {
            try {
                commit("setUnitListInitializing", true);
                // Reset pagination & unit
                state.units = [];
                state.unitPagination = {
                    total: 1,
                    page: 1
                };
                await dispatch("getUnits", state.unitTypeId);
                commit("setUnitListInitializing", false);
            } catch (error) {
                commit("setUnitListInitializing", false);
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Error",
                    text: "Failed to init unit data. Please try again later."
                });
            }
        },
        async getUnits({ commit, state }) {
            const perPage = 5000;

            let params = {
                queries: {
                    ...state.unitFilter,
                    "projectUnitType:id": state.unitTypeId
                },
                page: state.unitPagination.page,
                perPage: perPage
            };

            try {
                let res = await state.projectUnitAPI.getAllUnits(params);
                commit("setUnits", res);
            } catch (error) {
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Error",
                    text: "Failed to fetch units. Please try again later."
                });
            }
        },
        async loadNextUnits({ commit, state, dispatch }, scrollState) {
            let page = state.unitPagination.page;
            let total = state.unitPagination.total;

            // Load more if there are more pages
            if (page < total) {
                commit("incrementUnitPagination");
                await dispatch("getUnits");
                scrollState.loaded();
            } else {
                scrollState.loaded();
                scrollState.complete();
            }
        },
        async getUnit({ state, commit }, unitId) {
            try {
                commit("setIsLoading", true, { root: true });
                let data = await state.projectUnitAPI.getUnit(unitId);
                commit("setIsLoading", false, { root: true });

                return data;
            } catch (error) {
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Error",
                    text: "Failed to fetch unit data. Please try again later."
                });
            }
        },
        // ================================ MAP ================================
        async applyImageToMap({ state }) {
            if (state.mapOverlay) {
                state.sitePlanMap.removeLayer(state.mapOverlay);
                state.mapOverlay = null;
            }

            const imageURL = getFileURL(state.sitePlanImage[0]);
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

        // ============================= UNIT TYPE =============================
        async createUnitTypeSitePlan({ commit, state, dispatch }) {
            let geoJson = await dispatch("getGeoJson");

            let payload = {
                image: state.sitePlanImage,
                geoJson: geoJson
            };

            try {
                commit("setIsLoading", true, { root: true });
                await state.projectUnitTypeAPI.createInteractiveSitePlan(
                    state.unitTypeId,
                    UnitTypeModel.postInteractiveSitePlan(payload)
                );
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "success",
                    title: "Interactive Site Plan",
                    text: "Interactive site plan has been created successfully."
                });
            } catch (error) {
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Error",
                    text:
                        "Failed to create interactive site plan. Please try again later."
                });
            }
        },
        async updateUnitTypeSitePlan({ commit, state, dispatch }) {
            let geoJson = await dispatch("getGeoJson");

            let payload = {
                image: state.sitePlanImage,
                geoJson: geoJson
            };

            try {
                commit("setIsLoading", true, { root: true });
                await state.projectUnitTypeAPI.updateInteractiveSitePlan(
                    {
                        unitTypeId: state.unitTypeId,
                        sitePlanId: state.existingSitePlan.id
                    },
                    UnitTypeModel.postInteractiveSitePlan(payload)
                );
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "success",
                    title: "Interactive Site Plan",
                    text: "Interactive site plan has been updated successfully."
                });
            } catch (error) {
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Interactive Site Plan",
                    text:
                        "Failed to update interactive site plan. Please try again later."
                });
            }
        },
        async updateUnitStatus({ commit, state, dispatch }, { id, payload }) {
            try {
                commit("setIsLoading", true, { root: true });
                await state.projectUnitAPI.updateStatus({
                    id,
                    payload
                });
                this._vm.$notify({
                    group: "alert",
                    type: "success",
                    title: "Success",
                    text: "Unit status has been updated successfully."
                });
                state.changeStatusModal.isShown = false;
                commit("setIsLoading", false, { root: true });

                let unit = await dispatch("getUnit", id);
                commit("setUnitInList", unit);
            } catch (error) {
                commit("setIsLoading", false, { root: true });
                console.log(error);
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Update Status",
                    text: "Failed to update unit status."
                });
            }
        },
        async updateUnitPrice({ commit, state, dispatch }, { id, payload }) {
            try {
                commit("setIsLoading", true, { root: true });
                await state.projectUnitAPI.updateSalePrice({
                    id,
                    payload
                });
                this._vm.$notify({
                    group: "alert",
                    type: "success",
                    title: "Success",
                    text: "Unit price has been updated successfully."
                });
                state.changePriceModal.isShown = false;
                commit("setIsLoading", false, { root: true });

                let unit = await dispatch("getUnit", id);
                commit("setUnitInList", unit);
            } catch (error) {
                commit("setIsLoading", false, { root: true });
                this._vm.$notify({
                    group: "alert",
                    type: "error",
                    title: "Update Price",
                    text: "Failed to update unit price."
                });
            }
        }
    }
};
