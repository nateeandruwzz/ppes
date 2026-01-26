<script setup>
import Sidebar from '../components/Sidebar.vue'

const menuItem = [
    { title: 'แดชบอร์ด', icon: 'ChartLine', link: '/evaluatee/index' },
    { title: 'ประเมินตนเอง', icon: 'ClipboardPen', link: '/evaluatee/self-evaluate' },
    { title: 'ดูผลประเมิน', icon: 'FileText', link: '/evaluatee/results' },
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