<template>
    <div class="interactive-site-plan-editor">
        <div class="row window-height">
            <div class="col-9">
                <h1 class="block text-h4 q-pa-md q-my-none">Siteplan Editor</h1>
                <editor-map
                    :style="{ height: 'calc(100% - 72px)' }"
                ></editor-map>
                <div :style="{ position: 'relative', zIndex: 401 }">
                    <editor-selected-unit></editor-selected-unit>
                </div>
            </div>
            <editor-pane class="col-3"></editor-pane>
        </div>
    </div>
</template>

<script>
import EditorMap from "./EditorMap";
import EditorPane from "./EditorPane";

export default {
    components: {
        EditorMap,
        EditorPane,
        EditorSelectedUnit: () => import("./EditorSelectedUnit"),
    },
    mixins: [],
    props: {},
    data: function () {
        return {};
    },
    computed: {},
    watch: {},
    created: function () {},
    beforeUnmount: function () {},
    mounted: function () {},
    methods: {},
};
</script>

<style lang="scss">
.interactive-site-plan-editor {
}
</style>
