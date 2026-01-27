<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import Loading from '../../components/Loading.vue'

// State
const isLoading = ref(true)
const periods = ref([])
const reportData = ref([])
const orgStats = ref({ avg: '-', max: '-', min: '-' })

// Filter
const selectedPeriod = ref('')

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

// ดึงข้อมูล report จาก Backend
const loadReportData = async () => {
    if (!selectedPeriod.value) return

    isLoading.value = true
    try {
        const response = await api.get(`/evaluationResult/report/${selectedPeriod.value}`)
        if (response.data.status === 1) {
            reportData.value = response.data.data.reportData
            orgStats.value = response.data.data.orgStats
        } else {
            reportData.value = []
            orgStats.value = { avg: '-', max: '-', min: '-' }
        }
    } catch (error) {
        console.error('Error loading report data:', error)
        reportData.value = []
    } finally {
        isLoading.value = false
    }
}

// Export ตาราง
const handleExport = () => {
    window.print()
}

// Watch เมื่อเปลี่ยน period
watch(selectedPeriod, () => {
    loadReportData()
})

onMounted(async () => {
    await loadPeriods()
    await loadReportData()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
            <div>
                <h1 class="text-2xl font-bold text-zinc-800 flex items-center gap-2">
                    รายงานสรุปผลการประเมิน
                </h1>
                <p class="text-zinc-500 mt-1">ดูคะแนนภาพรวมของบุคลากรทุกคน</p>
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
                <button @click="handleExport"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
                    <component :is="lucide.FileDown" class="w-4 h-4" />
                    Export PDF
                </button>
            </div>
        </div>

        <!-- Loading -->
        <!-- Loading -->
        <Loading v-if="isLoading" />

        <div v-else class="space-y-6">
            <!-- Organization Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-sky-100 text-sky-600">
                            <component :is="lucide.TrendingUp" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">คะแนนเฉลี่ยองค์กร</p>
                            <p class="text-2xl font-bold text-zinc-900">{{ orgStats.avg }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <component :is="lucide.ArrowUp" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">คะแนนสูงสุด</p>
                            <p class="text-2xl font-bold text-emerald-600">{{ orgStats.max }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <component :is="lucide.ArrowDown" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-zinc-500">คะแนนต่ำสุด</p>
                            <p class="text-2xl font-bold text-amber-600">{{ orgStats.min }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Report Table -->
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div class="p-4 border-b border-zinc-100 bg-zinc-50/50 print:hidden">
                    <h3 class="font-semibold text-zinc-900">ตารางสรุปคะแนน</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-12">
                                    #</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ผู้รับการประเมิน</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    หน่วยงาน</th>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ตำแหน่ง</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    คะแนนตนเอง</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    คะแนนกรรมการ</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                    คะแนนรวม</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                            <tr v-if="reportData.length === 0">
                                <td colspan="7" class="px-6 py-12 text-center text-zinc-400">ไม่พบข้อมูล</td>
                            </tr>
                            <tr v-else v-for="(row, index) in reportData" :key="row.id" class="hover:bg-zinc-50/50">
                                <td class="px-6 py-4 text-zinc-400">{{ index + 1 }}</td>
                                <td class="px-6 py-4">
                                    <span class="font-medium text-zinc-800">{{ row.name }}</span>
                                </td>
                                <td class="px-6 py-4 text-zinc-600">{{ row.department }}</td>
                                <td class="px-6 py-4 text-zinc-600">{{ row.position }}</td>
                                <td class="px-6 py-4 text-center font-medium text-amber-600">{{ row.selfScore }}</td>
                                <td class="px-6 py-4 text-center font-medium text-sky-600">{{ row.committeeScore }}</td>
                                <td class="px-6 py-4 text-center font-bold text-zinc-900">{{ row.totalScore }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
