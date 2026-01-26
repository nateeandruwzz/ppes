<script setup>
import Sidebar from '../components/Sidebar.vue'

const menuItem = [
    { title: 'แดชบอร์ด', icon: 'ChartLine', link: '/committee/index' },
    { title: 'ประเมินบุคลากร', icon: 'ClipboardCheck', link: '/committee/evaluate' },
]
</script>

<template>
    <div class="flex">
        <!-- Sidebar -->
        <Sidebar :menu="menuItem" />

        <!-- Main content -->
        <main class="flex-1">
            <RouterView />
        </main>
    </div>
</template>