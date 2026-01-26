<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { useAuthStore } from '../../store/authStore'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// State
const isLoading = ref(true)
const users = ref([])
const evaluatees = ref([])
const departments = ref([])
const positions = ref([])
const periods = ref([])

// Stats
const totalUsers = computed(() => users.value.length)
const totalEvaluatees = computed(() => evaluatees.value.length)
const totalDepartments = computed(() => departments.value.length)
const activePeriod = computed(() => {
    const now = new Date()
    return periods.value.find(p => {
        const start = new Date(p.start_date)
        const end = new Date(p.end_date)
        return now >= start && now <= end
    })
})

// Helpers
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const loadData = async () => {
    isLoading.value = true
    try {
        const [userRes, evalRes, deptRes, posRes, periodRes] = await Promise.all([
            api.get('/user'),
            api.get('/evaluatee'),
            api.get('/department'),
            api.get('/position'),
            api.get('/period')
        ])

        if (userRes.data.status === 1) users.value = userRes.data.data
        if (evalRes.data.status === 1) evaluatees.value = evalRes.data.data
        if (deptRes.data.status === 1) departments.value = deptRes.data.data
        if (posRes.data.status === 1) positions.value = posRes.data.data
        if (periodRes.data.status === 1) periods.value = periodRes.data.data

    } catch (error) {
        console.error('Error loading dashboard data:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-zinc-800">
                    Dashboard ภาพรวมระบบ
                </h1>
                <p class="text-zinc-500 mt-1">สรุปข้อมูลระบบประเมินสมรรถนะบุคลากร</p>
            </div>

            <div class="">
                <button
                    @click="loadData()"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition-all duration-300 ease-in-out cursor-pointer">
                    <component :is="lucide.RefreshCcw" class="w-4.5 h-4.5"/>
                    รีโหลด
                </button>
            </div>
        </div>

        <!-- content -->
        <div v-if="isLoading" class="grid gap-6 md:grid-cols-4 animate-pulse">
            <div v-for="n in 4" :key="n" class="h-32 bg-zinc-100 rounded-2xl"></div>
        </div>

        <div v-else class="space-y-8">
            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Users -->
                <div
                    class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.Users" class="w-16 h-16 transform -translate-x-2 translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-blue-100 font-medium text-sm">ผู้ใช้งานทั้งหมด</p>
                        <h3 class="text-3xl font-bold mt-2">{{ totalUsers }}</h3>
                    </div>
                </div>

                <!-- Evaluatees -->
                <div
                    class="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.UserCheck" class="w-16 h-16 transform -translate-x-2 translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-orange-100 font-medium text-sm">ผู้ถูกประเมิน</p>
                        <h3 class="text-3xl font-bold mt-2">{{ totalEvaluatees }}</h3>
                    </div>
                </div>

                <!-- Departments -->
                <div
                    class="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl shadow-lg shadow-purple-500/20 text-white relative overflow-hidden group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.Building2" class="w-16 h-16 transform -translate-x-2 translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-purple-100 font-medium text-sm">แผนก</p>
                        <h3 class="text-3xl font-bold mt-2">{{ totalDepartments }}</h3>
                    </div>
                </div>

                <!-- Periods -->
                <div
                    class="bg-gradient-to-br from-sky-500 to-cyan-600 p-6 rounded-2xl shadow-lg shadow-sky-500/20 text-white relative overflow-hidden group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.Calendar" class="w-16 h-16 transform -translate-x-2 translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-sky-100 font-medium text-sm">รอบการประเมิน</p>
                        <h3 class="text-3xl font-bold mt-2">{{ periods.length }}</h3>
                    </div>
                </div>
            </div>

            <div class="grid lg:grid-cols-2 gap-8">
                <!-- Recent Periods -->
                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <h3 class="font-bold text-zinc-800">รอบการประเมินล่าสุด</h3>
                        <button class="text-xs font-medium text-sky-600 hover:text-sky-700">ดูทั้งหมด</button>
                    </div>
                    <div class="divide-y divide-zinc-100">
                        <div v-for="period in periods.slice(0, 5)" :key="period.id"
                            class="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                                    {{ period.id }}
                                </div>
                                <div>
                                    <h4 class="font-medium text-zinc-900">{{ period.name }}</h4>
                                    <p class="text-xs text-zinc-500">{{ formatDate(period.start_date) }} - {{
                                        formatDate(period.end_date) }}</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="{
                                'bg-green-100 text-green-700': new Date() >= new Date(period.start_date) && new Date() <= new Date(period.end_date),
                                'bg-zinc-100 text-zinc-500': new Date() > new Date(period.end_date),
                                'bg-amber-100 text-amber-700': new Date() < new Date(period.start_date)
                            }">
                                {{
                                    new Date() >= new Date(period.start_date) && new Date() <= new Date(period.end_date)
                                        ? 'กำลังดำเนิน' : new Date() > new Date(period.end_date) ? 'สิ้นสุดแล้ว' :
                                            'ยังไม่เริ่ม'
                                }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Departments Summary -->
                <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                        <h3 class="font-bold text-zinc-800">แผนก</h3>
                    </div>
                    <div class="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto">
                        <div v-for="dept in departments" :key="dept.id"
                            class="p-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors">
                            <div class="w-2 h-2 rounded-full bg-zinc-300"></div>
                            <span class="text-zinc-700 font-medium">{{ dept.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>