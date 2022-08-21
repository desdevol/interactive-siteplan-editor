<template>
    <div class="home">
        <SitePlanEditor></SitePlanEditor>
    </div>
</template>

<script>
import SitePlanEditor from "@/components/InteractiveSitePlan/Editor";

export default {
    name: "Home",
    components: {
        SitePlanEditor,
    },
};
</script>
