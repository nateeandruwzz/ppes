<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { useAuthStore } from '../../store/authStore'
import Loading from '../../components/Loading.vue'

// Store
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// State
const myEvaluateeInfo = ref(null)
const selfEvaluations = ref([])
const committeeEvaluations = ref([])
const indicators = ref([])
const scales = ref([])
const periods = ref([])
const isLoading = ref(false)

// ตัวกรอง
const selectedPeriod = ref('')

// ตัวชี้วัดตามรอบที่เลือก
const periodIndicators = computed(() => {
    if (!selectedPeriod.value) return []
    return indicators.value.filter(i => i.period_id == selectedPeriod.value)
})

// คะแนนทางการจาก Backend
const officialResult = ref(null)

const maxScale = computed(() => {
    if (scales.value.length === 0) return 5
    const periodScales = scales.value.filter(s => s.period_id == selectedPeriod.value)
    if (periodScales.length === 0) return 5
    return Math.max(...periodScales.map(s => Number(s.value)))
})

// คำนวณผลประเมิน
const evaluationResults = computed(() => {
    if (!selectedPeriod.value || !myEvaluateeInfo.value) return []

    return periodIndicators.value.map(indicator => {
        // หาการประเมินตนเอง
        const selfEval = selfEvaluations.value.find(e =>
            e.period_id == selectedPeriod.value &&
            e.evaluatee_id == myEvaluateeInfo.value.id &&
            e.indicator_id == indicator.id
        )

        // หาการประเมินจากกรรมการ
        const committeeEvals = committeeEvaluations.value.filter(e =>
            e.period_id == selectedPeriod.value &&
            e.evaluatee_id == myEvaluateeInfo.value.id &&
            e.indicator_id == indicator.id
        )

        // คำนวณค่าเฉลี่ยจากกรรมการ
        const avgCommitteeScore = committeeEvals.length > 0
            ? committeeEvals.reduce((sum, e) => sum + Number(e.score), 0) / committeeEvals.length
            : null

        return {
            indicator_id: indicator.id,
            indicator_name: indicator.name,
            indicator_weight: Number(indicator.weight),
            self_score: selfEval?.score ? Number(selfEval.score) : null,
            self_comment: selfEval?.comment ?? '',
            committee_score: avgCommitteeScore,
            committee_count: committeeEvals.length,
            committee_evaluations: committeeEvals
        }
    })
})

// คะแนนรวม
const totalScores = computed(() => {
    // Formula: (Score / MaxScale) * Weight
    const selfTotal = evaluationResults.value.reduce((sum, r) => {
        if (r.self_score === null) return sum
        const weighted = (r.self_score / maxScale.value) * r.indicator_weight
        return sum + weighted
    }, 0)

    // คะแนนกรรมการใช้จาก Official Result (Backend Calculation)
    const committeeTotalRaw = evaluationResults.value.reduce((sum, r) => {
        if (r.committee_score === null) return sum
        const weighted = (r.committee_score / maxScale.value) * r.indicator_weight
        return sum + weighted
    }, 0)

    // Use official result if available
    const committeeTotal = officialResult.value?.total_score
        ? Number(officialResult.value.total_score)
        : committeeTotalRaw

    return { self: selfTotal.toFixed(2), committee: committeeTotal.toFixed(2) }
})

// ดึงข้อมูล evaluatee ของ user ปัจจุบัน
const fetchMyEvaluateeInfo = async () => {
    try {
        const response = await api.get('/evaluatee')
        if (response.data.status === 1) {
            myEvaluateeInfo.value = response.data.data.find(e => e.user_id === currentUser.value?.id)
        }
    } catch (error) {
        console.error('Error fetching evaluatee info:', error)
    }
}

// ดึงข้อมูลตัวชี้วัด
const fetchIndicators = async () => {
    try {
        const response = await api.get('/indicator')
        if (response.data.status === 1) {
            indicators.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching indicators:', error)
    }
}

// ดึงข้อมูลเกณฑ์คะแนน
const fetchScales = async () => {
    try {
        const response = await api.get('/scale')
        if (response.data.status === 1) {
            scales.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching scales:', error)
    }
}

// ดึงข้อมูลรอบการประเมิน
const fetchPeriods = async () => {
    try {
        const response = await api.get('/period')
        if (response.data.status === 1) {
            periods.value = response.data.data
            if (response.data.data.length > 0) {
                selectedPeriod.value = response.data.data[0].id
            }
        }
    } catch (error) {
        console.error('Error fetching periods:', error)
    }
}

// ดึงข้อมูลการประเมินตนเอง
const fetchSelfEvaluations = async () => {
    try {
        const response = await api.get('/selfEvaluation')
        if (response.data.status === 1) {
            selfEvaluations.value = response.data.data
        } else {
            selfEvaluations.value = []
        }
    } catch (error) {
        console.error('Error fetching self evaluations:', error)
    }
}

// ดึงข้อมูลการประเมินจากกรรมการ
const fetchCommitteeEvaluations = async () => {
    try {
        const response = await api.get('/evaluation')
        if (response.data.status === 1) {
            committeeEvaluations.value = response.data.data
        } else {
            committeeEvaluations.value = []
        }
    } catch (error) {
        console.error('Error fetching committee evaluations:', error)
    }
}

const getScaleName = (score) => {
    if (score === null) return '-'
    const scale = scales.value.find(s => s.period_id == selectedPeriod.value && s.value == Math.round(score))
    return scale ? scale.name : score
}

const loadData = async () => {
    isLoading.value = true
    await Promise.all([
        fetchMyEvaluateeInfo(),
        fetchIndicators(),
        fetchScales(),
        fetchPeriods(),
        fetchSelfEvaluations(),
        fetchCommitteeEvaluations()
    ])
    // หลังจากได้ข้อมูลครบ ให้ดึง/คำนวณผลลัพธ์ทางการ
    if (selectedPeriod.value && myEvaluateeInfo.value) {
        // fetchOfficialResult logic removed
    }
    isLoading.value = false
}

// Watch removed as fetchOfficialResult is gone
import { watch } from 'vue'
watch(selectedPeriod, async (newVal) => {
    // Logic updated
})

// Export PDF function
const handleExportPdf = () => {
    window.print()
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="space-y-6 py-5 px-5 md:px-15">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex flex-col">
                <h2 class="text-2xl font-bold text-zinc-800">ผลการประเมิน</h2>
                <p class="text-zinc-500 text-sm">ดูผลการประเมินตนเองและจากกรรมการ</p>
            </div>

            <!-- เลือกรอบการประเมิณ -->
            <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-zinc-600">รอบการประเมิณ: </label>
                <select v-model="selectedPeriod"
                    class="px-2.5 py-2 rounded-xl bg-gray-100 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                    <option value="" disabled>เลือกรอบการประเมิณ</option>
                    <option v-for="period in periods" :key="period.id" :value="period.id">
                        {{ period.name }}
                    </option>
                </select>

                <!-- Export PDF Button -->
                <button @click="handleExportPdf"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg print:hidden">
                    <component :is="lucide.FileDown" class="w-4 h-4" />
                    Export PDF
                </button>
            </div>
        </div>

        <!-- Loading -->
        <!-- Loading -->
        <Loading v-if="isLoading" />

        <!-- ไม่พบข้อมูล -->
        <div v-else-if="!myEvaluateeInfo" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <component :is="lucide.AlertCircle" class="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 class="text-lg font-semibold text-amber-800 mb-1">ยังไม่มีข้อมูลผู้ถูกประเมิน</h3>
            <p class="text-amber-600 text-sm">กรุณาติดต่อ HR เพื่อเพิ่มคุณเข้าสู่รายชื่อผู้ถูกประเมิน</p>
        </div>

        <!-- ผลการประเมิน -->
        <div v-else class="space-y-4">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 text-white">
                    <div class="flex items-center gap-3 mb-2">
                        <component :is="lucide.User" class="w-6 h-6 opacity-80" />
                        <span class="font-medium">คะแนนประเมินตนเอง</span>
                    </div>
                    <div class="text-4xl font-bold">{{ totalScores.self }}</div>
                </div>
                <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div class="flex items-center gap-3 mb-2">
                        <component :is="lucide.Users" class="w-6 h-6 opacity-80" />
                        <span class="font-medium">คะแนนจากกรรมการ</span>
                    </div>
                    <div class="text-4xl font-bold">{{ totalScores.committee }}</div>
                </div>
            </div>

            <!-- ตารางผลประเมิน -->
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    ตัวชี้วัด</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center w-24">
                                    น้ำหนัก</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center w-32">
                                    คะแนนตนเอง</th>
                                <th
                                    class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center w-32">
                                    คะแนนกรรมการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                            <tr v-if="evaluationResults.length === 0">
                                <td colspan="4" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                            </tr>
                            <tr v-else v-for="result in evaluationResults" :key="result.indicator_id"
                                class="hover:bg-zinc-50/50">
                                <td class="px-6 py-4">
                                    <span class="font-medium text-zinc-800">{{ result.indicator_name }}</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="text-green-600 font-semibold">{{
                                        result.indicator_weight }}</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span v-if="result.self_score !== null" class="text-sky-600 font-semibold">
                                        {{ result.self_score.toFixed(1) }}
                                    </span>
                                    <span v-else class="text-zinc-400">-</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <div v-if="result.committee_score !== null">
                                        <span class="text-sky-600 font-semibold">
                                            {{ result.committee_score.toFixed(1) }}
                                        </span>
                                        <!-- <p class="text-xs text-zinc-400 mt-1">{{ result.committee_count }} คน</p> -->
                                    </div>
                                    <span v-else class="text-zinc-400">-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ความเห็นจากกรรมการ -->
            <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 class="font-semibold text-zinc-900 flex items-center gap-2">
                        <component :is="lucide.MessageCircle" class="w-5 h-5 text-sky-500" />
                        ความเห็นจากกรรมการ
                    </h3>
                </div>
                <div class="divide-y divide-zinc-100">
                    <div v-if="evaluationResults.filter(r => r.committee_evaluations.some(e => e.comment)).length === 0"
                        class="px-6 py-8 text-center text-zinc-400">
                        ยังไม่มีความเห็นจากกรรมการ
                    </div>
                    <template v-else>
                        <div v-for="result in evaluationResults.filter(r => r.committee_evaluations.some(e => e.comment))"
                            :key="'comment-' + result.indicator_id" class="p-4">
                            <div class="text-sm font-medium text-zinc-700 mb-2">{{ result.indicator_name }}</div>
                            <div v-for="evalItem in result.committee_evaluations.filter(e => e.comment)"
                                :key="'eval-' + evalItem.id" class="bg-zinc-50 rounded-lg p-3 mb-2 last:mb-0">
                                <p class="text-sm text-zinc-600">{{ evalItem.comment }}</p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
