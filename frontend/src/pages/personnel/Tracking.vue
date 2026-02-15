<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import Loading from '../../components/Loading.vue'
import EmptyState from '../../components/EmptyState.vue'

// State
const isLoading = ref(true)
const periods = ref([])
const trackingData = ref([])
const committeeTracking = ref([])
const expandedRows = ref([])
const stats = ref({ total: 0, completed: 0, inProgress: 0, pending: 0 })
const activeTab = ref('evaluatee')

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

const toggleRow = (id) => {
    if (expandedRows.value.includes(id)) {
        expandedRows.value = expandedRows.value.filter(rowId => rowId !== id)
    } else {
        expandedRows.value.push(id)
    }
}

// ดึง periods
const loadPeriods = async () => {
    try {
        const response = await api.get('/period')
        if (response.data.status === 1) {
            periods.value = response.data.data
            // Default to Active Period
            const now = new Date()
            const active = periods.value.find(p => {
                const start = new Date(p.start_date)
                const end = new Date(p.end_date)
                return now >= start && now <= end
            })
            if (active) {
                selectedPeriod.value = active.id
            } else if (periods.value.length > 0) {
                selectedPeriod.value = periods.value[0].id
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
            committeeTracking.value = response.data.data.committeeTracking || []
            stats.value = response.data.data.stats
        } else {
            trackingData.value = []
            committeeTracking.value = []
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

        <!-- Empty State -->
        <div class="border border-dashed rounded-3xl bg-zinc-50/50" v-if="trackingData.length === 0 && committeeTracking.length === 0">
            <EmptyState />
        </div>

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
                <div class="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <h3 class="font-semibold text-zinc-900">รายละเอียดสถานะ</h3>
                    <div class="flex bg-zinc-100 p-1 rounded-lg">
                        <button @click="activeTab = 'evaluatee'"
                            :class="activeTab === 'evaluatee' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
                            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">
                            ผู้รับการประเมิน
                        </button>
                        <button @click="activeTab = 'committee'"
                            :class="activeTab === 'committee' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
                            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">
                            กรรมการ
                        </button>
                    </div>
                </div>

                <!-- Tab: Evaluatee -->
                <div v-if="activeTab === 'evaluatee'" class="overflow-x-auto">
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

                <!-- Tab: Committee -->
                <div v-else class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ชื่อกรรมการ</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    ได้รับมอบหมาย (คน)</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    ประเมินแล้ว (คน)</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ความคืบหน้า</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                            <tr v-if="committeeTracking.length === 0">
                                <td colspan="4" class="px-6 py-12 text-center text-zinc-400">
                                    ไม่พบข้อมูลกรรมการ
                                </td>
                            </tr>
                            <template v-else v-for="row in committeeTracking" :key="row.id">
                                <tr @click="toggleRow(row.id)"
                                    class="hover:bg-zinc-50/50 cursor-pointer transition-colors border-b border-zinc-100 last:border-0">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform duration-200"
                                                :class="{ 'rotate-90': expandedRows.includes(row.id) }">
                                                <component :is="lucide.ChevronRight" class="w-5 h-5" />
                                            </div>
                                            <span class="font-medium text-zinc-800">{{ row.name }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-center font-medium text-zinc-600">{{ row.totalEvaluatees
                                    }}</td>
                                    <td class="px-6 py-4 text-center font-medium text-emerald-600">{{ row.evaluatedCount
                                    }}</td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                <div class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    :style="{ width: `${row.percent}%` }"></div>
                                            </div>
                                            <span class="text-xs font-medium text-zinc-600 w-8">{{ row.percent
                                            }}%</span>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Expanded Details -->
                                <tr v-if="expandedRows.includes(row.id)" class="bg-zinc-50/50">
                                    <td colspan="4" class="p-4 pl-16">
                                        <div class="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                                            <h4
                                                class="text-sm font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                                                <component :is="lucide.ListChecks" class="w-4 h-4 text-indigo-500" />
                                                รายการผู้รับการประเมิน
                                            </h4>
                                            <div v-if="!row.details || row.details.length === 0"
                                                class="text-center py-4 text-zinc-400 text-sm">
                                                ไม่มีรายการ
                                            </div>
                                            <table v-else class="w-full text-sm">
                                                <thead class="bg-zinc-50 text-xs text-zinc-500 uppercase">
                                                    <tr>
                                                        <th class="px-4 py-2 text-left rounded-l-lg">ชื่อ-สกุล</th>
                                                        <th class="px-4 py-2 text-center">สถานะ</th>
                                                        <th class="px-4 py-2 text-center rounded-r-lg">คะแนนเฉลี่ย</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-zinc-100">
                                                    <tr v-for="detail in row.details" :key="detail.id"
                                                        class="hover:bg-zinc-50">
                                                        <td class="px-4 py-3 font-medium text-zinc-700">{{ detail.name
                                                        }}</td>
                                                        <td class="px-4 py-3 text-center">
                                                            <span
                                                                class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                                                                :class="detail.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'">
                                                                {{ detail.status === 'completed' ? 'ประเมินแล้ว' :
                                                                    'รอการประเมิน' }}
                                                            </span>
                                                        </td>
                                                        <td class="px-4 py-3 text-center font-mono text-zinc-600">
                                                            {{ detail.score }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
