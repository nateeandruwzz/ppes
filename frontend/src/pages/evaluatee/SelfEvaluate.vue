<template>
    <div class="space-y-6 py-5 px-5 md:px-15">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-zinc-900">ประเมินตนเอง</h1>
                <p class="text-sm text-zinc-500 mt-1">เลือกรอบการประเมินเพื่อทำการประเมินตนเอง</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 3" :key="n" class="border rounded-xl p-5 space-y-4 animate-pulse bg-white">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-zinc-200 rounded-full"></div>
                    <div class="space-y-2 flex-1">
                        <div class="h-4 bg-zinc-200 rounded w-1/2"></div>
                        <div class="h-3 bg-zinc-200 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="h-10 bg-zinc-200 rounded w-full mt-4"></div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center">
            <h3 class="font-bold">เกิดข้อผิดพลาด</h3>
            <p class="text-sm mt-1">ไม่สามารถโหลดข้อมูลได้</p>
        </div>

        <!-- Empty State - No Evaluatee Info -->
        <div v-else-if="!myEvaluateeInfo"
            class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
            <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <component :is="lucide.AlertCircle" class="w-8 h-8 text-zinc-400" />
            </div>
            <h3 class="font-medium text-zinc-900">ยังไม่มีข้อมูลผู้ถูกประเมิน</h3>
            <p class="text-sm text-zinc-500">กรุณาติดต่อ HR เพื่อเพิ่มคุณเข้าสู่รายชื่อผู้ถูกประเมิน</p>
        </div>

        <!-- Empty State - No Periods -->
        <div v-else-if="periods.length === 0"
            class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
            <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <component :is="lucide.Calendar" class="w-8 h-8 text-zinc-400" />
            </div>
            <h3 class="font-medium text-zinc-900">ไม่มีรอบการประเมิน</h3>
            <p class="text-sm text-zinc-500">ยังไม่มีรอบการประเมินในขณะนี้</p>
        </div>

        <!-- Content - Period Cards -->
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="period in periods" :key="period.id"
                class="group bg-white rounded-xl border border-zinc-200 p-5 hover:border-sky-200 hover:shadow-md transition-all duration-200 flex flex-col">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                            <component :is="lucide.Calendar" class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-zinc-900 leading-tight">{{ period.name }}</h3>
                            <p class="text-xs text-zinc-500 mt-0.5">{{ formatDate(period.start_date) }} - {{
                                formatDate(period.end_date) }}</p>
                        </div>
                    </div>
                    <span :class="getStatusClass(period.id)" class="text-xs px-2 py-1 rounded-full font-medium">
                        {{ getStatusLabel(period.id) }}
                    </span>
                </div>

                <div class="space-y-2 mb-6 flex-1">
                    <div class="flex items-center justify-between text-sm py-1 border-b border-dashed border-zinc-100">
                        <span class="text-zinc-500">ตัวชี้วัด</span>
                        <span class="font-medium text-zinc-700">{{ getIndicatorCount(period.id) }} รายการ</span>
                    </div>
                    <div class="flex items-center justify-between text-sm py-1">
                        <span class="text-zinc-500">ประเมินแล้ว</span>
                        <span class="font-medium text-zinc-700">{{ getCompletedCount(period.id) }} / {{
                            getIndicatorCount(period.id) }}</span>
                    </div>
                </div>

                <button @click="goToEvaluation(period.id)"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors cursor-pointer">
                    {{ getStatusLabel(period.id) === 'ประเมินครบแล้ว' ? 'ดู/แก้ไขการประเมิน' : 'เริ่มประเมิน' }}
                    <component :is="lucide.ArrowRight" class="w-4 h-4 opacity-70" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { useAuthStore } from '../../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// State
const myEvaluateeInfo = ref(null)
const indicators = ref([])
const periods = ref([])
const selfEvaluations = ref([])
const isLoading = ref(false)
const isError = ref(false)

// Helpers
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getIndicatorCount = (periodId) => {
    return indicators.value.filter(i => i.period_id == periodId).length
}

const getCompletedCount = (periodId) => {
    if (!myEvaluateeInfo.value) return 0
    return selfEvaluations.value.filter(e =>
        e.period_id == periodId &&
        e.evaluatee_id == myEvaluateeInfo.value.id
    ).length
}

const getStatusLabel = (periodId) => {
    const total = getIndicatorCount(periodId)
    const completed = getCompletedCount(periodId)
    if (total === 0) return 'ไม่มีตัวชี้วัด'
    if (completed === 0) return 'รอการประเมิน'
    if (completed >= total) return 'ประเมินครบแล้ว'
    return 'กำลังดำเนินการ'
}

const getStatusClass = (periodId) => {
    const status = getStatusLabel(periodId)
    switch (status) {
        case 'ประเมินครบแล้ว': return 'bg-green-50 text-green-700'
        case 'กำลังดำเนินการ': return 'bg-amber-50 text-amber-700'
        case 'ไม่มีตัวชี้วัด': return 'bg-zinc-100 text-zinc-500'
        default: return 'bg-zinc-100 text-zinc-600'
    }
}

const goToEvaluation = (periodId) => {
    router.push(`/evaluatee/self-evaluate/${periodId}`)
}

// API Calls
const fetchMyEvaluateeInfo = async () => {
    const response = await api.get('/evaluatee')
    if (response.data.status === 1) {
        myEvaluateeInfo.value = response.data.data.find(e => e.user_id === currentUser.value?.id)
    }
}

const fetchIndicators = async () => {
    const response = await api.get('/indicator')
    if (response.data.status === 1) {
        indicators.value = response.data.data
    }
}

const fetchPeriods = async () => {
    const response = await api.get('/period')
    if (response.data.status === 1) {
        periods.value = response.data.data
    }
}

const fetchSelfEvaluations = async () => {
    const response = await api.get('/selfEvaluation')
    if (response.data.status === 1) {
        selfEvaluations.value = response.data.data
    } else {
        selfEvaluations.value = []
    }
}

// Load Data
const loadData = async () => {
    isLoading.value = true
    isError.value = false
    try {
        await Promise.all([
            fetchMyEvaluateeInfo(),
            fetchIndicators(),
            fetchPeriods(),
            fetchSelfEvaluations()
        ])
    } catch (error) {
        console.error('Error loading data:', error)
        isError.value = true
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>