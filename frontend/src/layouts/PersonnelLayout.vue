<script setup>
import Sidebar from '../components/Sidebar.vue'

const menuItem = [
    { title: 'แดชบอร์ด', icon: 'ChartLine', link: '/personnel/index' },
    { title: 'รอบการประเมิน', icon: 'Calendar', link: '/personnel/periods' },
    { title: 'หัวข้อการประเมิน', icon: 'ClipboardPen', link: '/personnel/topics' },
    { title: 'ตัวชี้วัด', icon: 'BookmarkCheck', link: '/personnel/indicators' },
    { title: 'แผนก', icon: 'Building2', link: '/personnel/department' },
    { title: 'ตำแหน่ง', icon: 'Briefcase', link: '/personnel/position' },
    { title: 'คณะกรรมการ', icon: 'Users', link: '/personnel/committee' },
    { title: 'ผู้รับการประเมิน', icon: 'User', link: '/personnel/evaluatee' },
    { title: 'มอบหมายการประเมิน', icon: 'UserCheck', link: '/personnel/assignment' },
]
</script>

<template>
    <div class="flex">
        <!-- Sidbar -->
        <Sidebar :menu="menuItem" />

        <!-- Main content -->
        <main class="flex-1 py-5 px-5 md:px-15">
            <RouterView />
        </main>
    </div>
</template>