<template>
    <div class="not-found-404 full-width">
        <div class="full-width q-mb-lg">
            <h1 class="block text-center">404</h1>
            <h2 class="block text-center">Page Not Found</h2>
        </div>
        <div class="row justify-center full-width">
            <q-btn
                color="primary"
                size="xl"
                class="q-px-xl shadow-12"
                :to="{ name: 'Home' }"
            >
                Go Home
            </q-btn>
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.not-found-404 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    height: 100vh;
    background: #f5f5f5;

    h1 {
        font-size: 12rem;
        font-weight: 100;
        color: #333;
        margin-bottom: 24px;
    }
    h2 {
        font-size: 3rem;
        font-weight: 800;
        color: #333;
    }
}
</style>
