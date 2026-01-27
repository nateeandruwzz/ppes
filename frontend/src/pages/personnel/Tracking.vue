<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import Loading from '../../components/Loading.vue'

// State
const isLoading = ref(true)
const periods = ref([])
const trackingData = ref([])
const stats = ref({ total: 0, completed: 0, inProgress: 0, pending: 0 })

// Filter
const selectedPeriod = ref('')

const getStatusBadge = (status) => {
    switch (status) {
        case 'completed':
            return { class: 'bg-emerald-100 text-emerald-700', text: 'เสร็จสิ้น' }
        case 'in_progress':
            return { class: 'bg-amber-100 text-amber-700', text: 'กำลังดำเนินการ' }
        default:
            return { class: 'bg-zinc-100 text-zinc-600', text: 'รอดำเนินการ' }
    }
}

// ดึง periods
const loadPeriods = async () => {
    try {
        const response = await api.get('/period')
        if (response.data.status === 1) {
            periods.value = response.data.data
            if (response.data.data.length > 0) {
                selectedPeriod.value = response.data.data[0].id
            }
        }
    } catch (error) {
        console.error('Error loading periods:', error)
    }
}

// ดึงข้อมูล tracking จาก Backend
const loadTrackingData = async () => {
    if (!selectedPeriod.value) return

    isLoading.value = true
    try {
        const response = await api.get(`/evaluationResult/tracking/${selectedPeriod.value}`)
        if (response.data.status === 1) {
            trackingData.value = response.data.data.trackingData
            stats.value = response.data.data.stats
        } else {
            trackingData.value = []
            stats.value = { total: 0, completed: 0, inProgress: 0, pending: 0 }
        }
    } catch (error) {
        console.error('Error loading tracking data:', error)
        trackingData.value = []
    } finally {
        isLoading.value = false
    }
}

// Watch เมื่อเปลี่ยน period
watch(selectedPeriod, () => {
    loadTrackingData()
})

onMounted(async () => {
    await loadPeriods()
    await loadTrackingData()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-zinc-800 flex items-center gap-2">
                    ติดตามสถานะการประเมิน
                </h1>
                <p class="text-zinc-500 mt-1">ดูสถานะการส่งแบบประเมินของบุคลากรทุกคน</p>
            </div>

            <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-zinc-600">รอบการประเมิน:</label>
                <select v-model="selectedPeriod"
                    class="px-3 py-2 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                    <option value="" disabled>เลือกรอบ</option>
                    <option v-for="period in periods" :key="period.id" :value="period.id">
                        {{ period.name }}
                    </option>
                </select>
                <button @click="loadTrackingData()"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors">
                    <component :is="lucide.RefreshCcw" class="w-4 h-4" />
                    รีโหลด
                </button>
            </div>
        </div>

        <!-- Loading -->
        <!-- Loading -->
        <Loading v-if="isLoading" />

        <div v-else class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-sky-100 text-sky-600">
                            <component :is="lucide.Users" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">ทั้งหมด</p>
                            <p class="text-2xl font-bold text-zinc-900">{{ stats.total }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <component :is="lucide.CheckCircle" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">เสร็จสิ้น</p>
                            <p class="text-2xl font-bold text-emerald-600">{{ stats.completed }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <component :is="lucide.Clock" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">กำลังดำเนินการ</p>
                            <p class="text-2xl font-bold text-amber-600">{{ stats.inProgress }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-zinc-100 text-zinc-600">
                            <component :is="lucide.CircleDashed" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">รอดำเนินการ</p>
                            <p class="text-2xl font-bold text-zinc-600">{{ stats.pending }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tracking Table -->
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div class="p-4 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 class="font-semibold text-zinc-900">รายละเอียดสถานะ</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ผู้รับการประเมิน</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    หน่วยงาน</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ตำแหน่ง</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    ประเมินตนเอง</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    กรรมการประเมิน</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    สถานะ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                            <tr v-if="trackingData.length === 0">
                                <td colspan="6" class="px-6 py-12 text-center text-zinc-400">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                            <tr v-else v-for="row in trackingData" :key="row.id" class="hover:bg-zinc-50/50">
                                <td class="px-6 py-4">
                                    <span class="font-medium text-zinc-800">{{ row.name }}</span>
                                </td>
                                <td class="px-6 py-4 text-zinc-600">{{ row.department }}</td>
                                <td class="px-6 py-4 text-zinc-600">{{ row.position }}</td>
                                <td class="px-6 py-4 text-center">
                                    <component v-if="row.selfEval" :is="lucide.CheckCircle2"
                                        class="w-5 h-5 text-emerald-500 mx-auto" />
                                    <component v-else :is="lucide.Circle" class="w-5 h-5 text-zinc-300 mx-auto" />
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span
                                        :class="row.completedCommittees >= row.totalCommittees ? 'text-emerald-600' : 'text-amber-600'"
                                        class="font-medium">
                                        {{ row.completedCommittees }}/{{ row.totalCommittees }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span :class="getStatusBadge(row.status).class"
                                        class="inline-flex px-3 py-1 rounded-full text-xs font-medium">
                                        {{ getStatusBadge(row.status).text }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
