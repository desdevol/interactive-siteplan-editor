<template>
    <div class="interactive-site-plan-editor--selected-unit">
        <q-expansion-item dense-toggle expand-separator label="Selected Unit">
            <Unit
                v-if="selectedUnit"
                class="selected-unit"
                :unit="selectedUnit"
            >
                <div class="row justify-end">
                    <q-btn
                        color="negative"
                        flat
                        @click="removeSelectedLayerUnitId"
                    >
                        <i class="fas fa-trash"></i>
                    </q-btn>
                </div>
            </Unit>
        </q-expansion-item>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import Unit from "@/components/Unit";

export default {
    components: {
        Unit,
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
.interactive-site-plan-editor--selected-unit {
    position: absolute;
    right: 10px;
    bottom: 10px;
    width: 350px;
    box-shadow: 0 0 5px #00000025;
    border-radius: 8px;
    background: white;
}
</style>
