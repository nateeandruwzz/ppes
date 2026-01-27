<template>
    <div class="space-y-6 py-5 px-5 md:px-15">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-zinc-900">ประเมินบุคลากร</h1>
                <p class="text-sm text-zinc-500 mt-1">รายชื่อผู้รับการประเมินที่คุณได้รับมอบหมาย</p>
            </div>
        </div>

        <!-- Filter -->
        <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-zinc-600">กรองตามรอบการประเมิน:</label>
            <select v-model="selectedPeriodFilter"
                class="px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                <option value="">ทั้งหมด</option>
                <option v-for="period in periods" :key="period.id" :value="period.id">
                    {{ period.name }}
                </option>
            </select>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 3" :key="n" class="border rounded-xl p-5 space-y-4 animate-pulse bg-white">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-zinc-200 rounded-full"></div>
                    <div class="space-y-2 flex-1">
                        <div class="h-4 bg-zinc-200 rounded w-1/2"></div>
                        <div class="h-3 bg-zinc-200 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="h-10 bg-zinc-200 rounded w-full mt-4"></div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="myAssignments.length === 0"
            class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
            <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <component :is="lucide.ClipboardList" class="w-8 h-8 text-zinc-400" />
            </div>
            <h3 class="font-medium text-zinc-900">ไม่มีรายการที่ต้องประเมิน</h3>
            <p class="text-sm text-zinc-500">คุณยังไม่ได้รับมอบหมายให้ประเมินใครในขณะนี้</p>
        </div>

        <!-- Content - Assignment Cards -->
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="assignment in myAssignments" :key="assignment.id"
                class="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                            <component :is="lucide.User" class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-zinc-900 leading-tight">{{
                                getEvaluateeName(assignment.evaluatee_id) }}</h3>
                            <p class="text-xs text-zinc-500 mt-0.5">{{ getEvaluateePosition(assignment.evaluatee_id) }}
                            </p>
                        </div>
                    </div>
                    <span :class="getStatusClass(assignment)" class="text-xs px-2 py-1 rounded-full font-medium">
                        {{ isSummarized(assignment) ? 'สรุปผลแล้ว' : getStatusLabel(assignment) }}
                    </span>
                </div>

                <div class="space-y-2 mb-6 flex-1">
                    <div class="flex items-center justify-between text-sm py-1 border-b border-dashed border-zinc-100">
                        <span class="text-zinc-500">รอบการประเมิน</span>
                        <span class="font-medium text-zinc-700">{{ getPeriodName(assignment.period_id) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm py-1 border-b border-dashed border-zinc-100">
                        <span class="text-zinc-500">แผนก</span>
                        <span class="font-medium text-zinc-700 truncate max-w-[150px]">{{
                            getEvaluateeDepartment(assignment.evaluatee_id) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm py-1">
                        <span class="text-zinc-500">ประเมินแล้ว</span>
                        <span class="font-medium text-zinc-700">{{ getCompletedCount(assignment) }} / {{
                            getIndicatorCount(assignment.period_id) }}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button @click="goToEvaluation(assignment)"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors cursor-pointer">
                        <component :is="lucide.ClipboardCheck" class="w-4 h-4" />
                        {{ getStatusLabel(assignment) === 'ประเมินครบแล้ว' ? 'ดู/แก้ไข' : 'ประเมิน' }}
                    </button>
                    
                    <!-- ปุ่มสรุปผล สำหรับประธานเท่านั้น -->
                    <button v-if="isChairman(assignment) && getStatusLabel(assignment) === 'ประเมินครบแล้ว'"
                        @click="goToSummary(assignment)"
                        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors cursor-pointer">
                        <component :is="lucide.FileCheck" class="w-4 h-4" />
                        สรุปผล
                    </button>
                </div>
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
const assignments = ref([])
const evaluations = ref([])
const indicators = ref([])
const periods = ref([])
const evaluatees = ref([])
const users = ref([])
const departments = ref([])
const positions = ref([])
const committeeSummaries = ref([])
const isLoading = ref(false)

// ตัวกรอง
const selectedPeriodFilter = ref('')

// รายการผู้ถูกประเมินที่กรรมการได้รับมอบหมาย
const myAssignments = computed(() => {
    if (!currentUser.value) return []
    let filtered = assignments.value.filter(a => a.committee_user_id === currentUser.value.id)
    if (selectedPeriodFilter.value) {
        filtered = filtered.filter(a => a.period_id == selectedPeriodFilter.value)
    }
    return filtered
})

// Helper functions
const getPeriodName = (id) => {
    const period = periods.value.find(p => p.id === id)
    return period ? period.name : '-'
}

const getEvaluateeName = (evaluateeId) => {
    const evaluatee = evaluatees.value.find(e => e.id === evaluateeId)
    if (!evaluatee) return '-'
    const user = users.value.find(u => u.id === evaluatee.user_id)
    return user ? `${user.first_name} ${user.last_name}` : '-'
}

const getEvaluateePosition = (evaluateeId) => {
    const evaluatee = evaluatees.value.find(e => e.id === evaluateeId)
    if (!evaluatee) return '-'
    const position = positions.value.find(p => p.id === evaluatee.position_id)
    return position ? position.name : '-'
}

const getEvaluateeDepartment = (evaluateeId) => {
    const evaluatee = evaluatees.value.find(e => e.id === evaluateeId)
    if (!evaluatee) return '-'
    const department = departments.value.find(d => d.id === evaluatee.department_id)
    return department ? department.name : '-'
}

const getIndicatorCount = (periodId) => {
    return indicators.value.filter(i => i.period_id == periodId).length
}

const getCompletedCount = (assignment) => {
    return evaluations.value.filter(e =>
        e.period_id == assignment.period_id &&
        e.evaluatee_id == assignment.evaluatee_id &&
        e.committee_user_id == currentUser.value?.id
    ).length
}

const getStatusLabel = (assignment) => {
    const total = getIndicatorCount(assignment.period_id)
    const completed = getCompletedCount(assignment)
    if (total === 0) return 'ไม่มีตัวชี้วัด'
    if (completed === 0) return 'รอประเมิน'
    if (completed >= total) return 'ประเมินครบแล้ว'
    return 'กำลังดำเนินการ'
}

const getStatusClass = (assignment) => {
    // ถ้าสรุปผลแล้ว แสดงสีม่วง
    if (isSummarized(assignment)) {
        return 'bg-purple-50 text-purple-700'
    }
    const status = getStatusLabel(assignment)
    switch (status) {
        case 'ประเมินครบแล้ว': return 'bg-green-50 text-green-700'
        case 'กำลังดำเนินการ': return 'bg-amber-50 text-amber-700'
        case 'ไม่มีตัวชี้วัด': return 'bg-zinc-100 text-zinc-500'
        default: return 'bg-zinc-100 text-zinc-600'
    }
}

// เช็คว่าสรุปผลแล้วหรือยัง
const isSummarized = (assignment) => {
    return committeeSummaries.value.some(s =>
        s.period_id == assignment.period_id &&
        s.evaluatee_id == assignment.evaluatee_id
    )
}

const goToEvaluation = (assignment) => {
    router.push(`/committee/evaluate/${assignment.period_id}/${assignment.evaluatee_id}`)
}

const goToSummary = (assignment) => {
    router.push(`/committee/summary/${assignment.period_id}/${assignment.evaluatee_id}`)
}

const isChairman = (assignment) => {
    return assignment.role === 'Chairman'
}

// API Calls
const fetchAssignments = async () => {
    const response = await api.get('/committee')
    if (response.data.status === 1) {
        assignments.value = response.data.data
    }
}

const fetchEvaluations = async () => {
    const response = await api.get('/evaluation')
    if (response.data.status === 1) {
        evaluations.value = response.data.data
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

const fetchEvaluatees = async () => {
    const response = await api.get('/evaluatee')
    if (response.data.status === 1) {
        evaluatees.value = response.data.data
    }
}

const fetchUsers = async () => {
    const response = await api.get('/user/role/Evaluatees')
    if (response.data.status === 1) {
        users.value = response.data.data
    }
}

const fetchDepartments = async () => {
    const response = await api.get('/department')
    if (response.data.status === 1) {
        departments.value = response.data.data
    }
}

const fetchPositions = async () => {
    const response = await api.get('/position')
    if (response.data.status === 1) {
        positions.value = response.data.data
    }
}

const fetchCommitteeSummaries = async () => {
    const response = await api.get('/committeeSummary')
    if (response.data.status === 1) {
        committeeSummaries.value = response.data.data
    }
}

// Load Data
const loadData = async () => {
    isLoading.value = true
    try {
        await Promise.all([
            fetchAssignments(),
            fetchEvaluations(),
            fetchIndicators(),
            fetchPeriods(),
            fetchEvaluatees(),
            fetchUsers(),
            fetchDepartments(),
            fetchPositions(),
            fetchCommitteeSummaries()
        ])
    } catch (error) {
        console.error('Error loading data:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>
