<template>
    <div class="project-interactive-site-plan-editor--selected-unit">
        <Unit v-if="selectedUnit" class="selected-unit" :unit="selectedUnit">
        </Unit>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
    components: {
        Unit: () => import("@/components/Unit"),
    },
    mixins: [],
    props: {},
    data: function () {
        return {};
    },
    computed: {
        ...mapGetters({
            selectedUnit: "sitePlanEditor/getSelectedLayerUnit",
        }),
    },
    watch: {},
    created: function () {},
    beforeUnmount: function () {},
    mounted: function () {},
    methods: {
        ...mapMutations({
            removeSelectedLayerUnitId:
                "sitePlanEditor/removeSelectedLayerUnitId",
        }),
    },
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
