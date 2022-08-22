<template>
    <div class="unit q-pa-lg">
        <div class="row nowrap">
            <div class="plot q-mb-md q-mr-md">{{ unit.plot }}</div>
            <p class="street">{{ unit.street }}</p>
        </div>

        <span class="q-pr-lg bed-bath">
            <i class="fas fa-bed q-mr-xs"></i>
            {{ unit.bedroom }}
        </span>
        <span class="q-pr-lg bed-bath"
            ><i class="fas fa-bath q-mr-xs"></i>
            {{ unit.bathroom }}
        </span>

        <slot></slot>
    </div>
</template>

<script>
export default {
    components: {},
    mixins: [],
    props: {
        unit: {
            type: Object,
            required: true,
        },
    },
    data: function () {
        return {};
    },
    computed: {},
    watch: {},
    created: function () {},
    mounted: function () {},
    methods: {},
};
</script>

<style lang="scss">
.unit {
    .plot {
        border-radius: 8px;
        padding: 4px 12px;
        border: solid 1px $primary;
        width: fit-content;
        color: $primary;
        font-size: 24px;
    }
    .street {
        font-size: 16px;
    }
    .bed-bath {
        font-size: 16px;
        color: #454545;
    }
}
</style>
