<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../services/axios'
import { BASE_URL } from '../../config'
import { useRouter } from 'vue-router'
import * as lucide from 'lucide-vue-next'
import { useAuthStore } from '../../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// State
const isLoading = ref(true)
const myEvaluateeInfo = ref(null)
const periods = ref([])
const selfEvaluations = ref([])
const indicators = ref([])
const positions = ref([])
const departments = ref([])
const selectedPeriodId = ref(null)

console.log('Info: ', myEvaluateeInfo.value);

// Computed Stats
const activePeriod = computed(() => {
    // If user selected a period, use that
    if (selectedPeriodId.value) {
        const selected = periods.value.find(p => p.id == selectedPeriodId.value)
        if (selected) return selected
    }
    // ถ้าไม่ได้เลือก ให้หา period ที่ยัง open อยู่ (เทียบกับวันปัจจุบัน)
    const now = new Date()
    const current = periods.value.find(p => {
        const start = new Date(p.start_date)
        const end = new Date(p.end_date)
        return now >= start && now <= end
    })
    return current || periods.value[0] // fallback to first period if none active
})

const periodEvaluations = computed(() => {
    if (!activePeriod.value || !myEvaluateeInfo.value) return []
    return selfEvaluations.value.filter(e =>
        e.period_id == activePeriod.value.id &&
        e.evaluatee_id == myEvaluateeInfo.value.id
    )
})

const periodIndicators = computed(() => {
    if (!activePeriod.value) return []
    return indicators.value.filter(i => i.period_id == activePeriod.value.id)
})

const progress = computed(() => {
    const total = periodIndicators.value.length
    if (total === 0) return 0
    const completed = periodEvaluations.value.length
    return Math.round((completed / total) * 100)
})

const isCompleted = computed(() => {
    return periodIndicators.value.length > 0 &&
        periodEvaluations.value.length >= periodIndicators.value.length
})

// Helpers
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getPositionName = (id) => {
    if (!id) return '-'
    const pos = positions.value.find(p => p.id === id)
    return pos ? pos.name : '-'
}

const getDepartmentName = (id) => {
    if (!id) return '-'
    const dept = departments.value.find(d => d.id === id)
    return dept ? dept.name : '-'
}

// Actions
const goToSelfEvaluate = () => {
    router.push('/evaluatee/self-evaluate')
}

const goToResults = () => {
    router.push('/evaluatee/results')
}

// API Calls
const loadData = async () => {
    isLoading.value = true
    try {
        // First get current user evaluatee info
        const evaluateeRes = await api.get('/evaluatee')
        if (evaluateeRes.data.status === 1) {
            myEvaluateeInfo.value = evaluateeRes.data.data.find(e => e.user_id == currentUser.value?.id)
        }

        // Fetch only assigned periods for this user
        let periodRes
        if (currentUser.value?.id) {
            periodRes = await api.get(`/period/user/${currentUser.value.id}`)
        } else {
            periodRes = await api.get('/period')
        }

        const [selfEvalRes, indicatorRes, posRes, deptRes] = await Promise.all([
            api.get('/selfEvaluation'),
            api.get('/indicator'),
            api.get('/position'),
            api.get('/department')
        ])

        if (periodRes.data.status === 1) {
            periods.value = periodRes.data.data
            // Set default to first period
            if (periods.value.length > 0 && !selectedPeriodId.value) {
                selectedPeriodId.value = periods.value[0].id
            }
        }
        if (selfEvalRes.data.status === 1) selfEvaluations.value = selfEvalRes.data.data
        if (indicatorRes.data.status === 1) indicators.value = indicatorRes.data.data
        if (posRes.data.status === 1) positions.value = posRes.data.data
        if (deptRes.data.status === 1) departments.value = deptRes.data.data

    } catch (error) {
        console.error('Error loading dashboard data:', error)
    } finally {
        isLoading.value = false
        // Debug
        console.log('--- Debug Dashboard ---')
        console.log('Periods:', periods.value)
        console.log('Active Period:', activePeriod.value)
        console.log('Current User:', currentUser.value)
        console.log('My Evaluatee Info:', myEvaluateeInfo.value)
    }
}



onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="space-y-8 py-5 px-5 md:px-15">
        <!-- Welcome Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-zinc-800">
                    สวัสดี, {{ currentUser?.first_name }} {{ currentUser?.last_name }} 👋
                </h1>
                <p class="text-zinc-500 mt-1">ยินดีต้อนรับสู่ระบบประเมินบุคลากร</p>
            </div>
            <div class="text-right hidden md:block">
                <p class="text-sm font-medium text-zinc-900">{{ new Date().toLocaleDateString('th-TH', {
                    weekday:
                        'long', day: 'numeric', month: 'long', year: 'numeric'
                }) }}</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
            <div class="h-40 bg-zinc-100 rounded-2xl"></div>
            <div class="h-40 bg-zinc-100 rounded-2xl"></div>
            <div class="h-40 bg-zinc-100 rounded-2xl"></div>
        </div>

        <!-- Content -->
        <div v-else class="space-y-8">
            <!-- Active Period Card -->
            <div v-if="activePeriod"
                class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/20">

                <!-- Period Dropdown at top-right -->
                <div v-if="periods.length > 0" class="absolute top-4 right-4 z-20">
                    <select v-model="selectedPeriodId"
                        class="px-3 py-1.5 rounded-lg bg-white/90 text-zinc-800 text-sm font-medium outline-none border-0 cursor-pointer shadow-lg">
                        <option v-for="period in periods" :key="period.id" :value="period.id">
                            {{ period.name }}
                        </option>
                    </select>
                </div>

                <div class="absolute top-10 right-10 p-8 opacity-10">
                    <component :is="lucide.Calendar" class="w-48 h-48 transform translate-x-12 -translate-y-12" />
                </div>

                <div class="relative p-8 md:p-10 z-10 w-full md:w-2/3">
                    <span
                        class="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm mb-4">
                        รอบการประเมินปัจจุบัน
                    </span>
                    <h2 class="text-3xl font-bold mb-2 leading-tight">{{ activePeriod.name }}</h2>
                    <p class="text-sky-100 mb-8 flex items-center gap-2">
                        <component :is="lucide.Clock" class="w-4 h-4" />
                        {{ formatDate(activePeriod.start_date) }} - {{ formatDate(activePeriod.end_date) }}
                    </p>

                    <div class="space-y-4 max-w-sm">
                        <div class="flex justify-between text-sm font-medium text-sky-50">
                            <span>ความคืบหน้าการประเมินตนเอง</span>
                            <span>{{ progress }}%</span>
                        </div>
                        <div class="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div class="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                :style="{ width: `${progress}%` }"></div>
                        </div>

                        <div class="pt-4">
                            <button @click="goToSelfEvaluate"
                                class="bg-white text-sky-600 hover:bg-sky-50 px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/5 transition-all flex items-center gap-2 cursor-pointer">
                                <component :is="isCompleted ? lucide.CheckCircle : lucide.PlayCircle" class="w-5 h-5" />
                                {{ isCompleted ? 'ดูการประเมินของคุณ' : 'ทำการประเมินตอนนี้' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Active Period -->
            <div v-else class="bg-zinc-50/50 rounded-3xl p-10 text-center border border-dashed border-zinc-200">
                <component :is="lucide.CalendarOff" class="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 class="text-xl font-bold text-zinc-700">ไม่มีรอบการประเมินในขณะนี้</h3>
                <p class="text-zinc-500 mt-2">คุณสามารถตรวจสอบผลการประเมินย้อนหลังได้ที่เมนูผลการประเมิน</p>
            </div>

            <!-- Menus Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Card 1: Self Evaluate -->
                <button @click="goToSelfEvaluate"
                    class="group bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden text-left hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.ClipboardList"
                            class="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div class="relative z-10">
                        <div
                            class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <component :is="lucide.ClipboardList" class="w-6 h-6" />
                        </div>
                        <h3 class="text-lg font-bold mb-1">ประเมินตนเอง</h3>
                        <p class="text-indigo-100 text-sm leading-relaxed opacity-90">
                            ทำแบบประเมินสมรรถนะของตนเองประจำรอบการประเมิน</p>
                    </div>
                </button>

                <!-- Card 2: Results -->
                <button @click="goToResults"
                    class="group bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden text-left hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.BarChart2" class="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div class="relative z-10">
                        <div
                            class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <component :is="lucide.BarChart2" class="w-6 h-6" />
                        </div>
                        <h3 class="text-lg font-bold mb-1">ผลการประเมิน</h3>
                        <p class="text-emerald-100 text-sm leading-relaxed opacity-90">
                            ดูคะแนนและผลสรุปการประเมินจากคณะกรรมการ</p>
                    </div>
                </button>

                <!-- Card 3: Profile (Optional Info) -->
                <div
                    class="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-500/20 text-white relative overflow-hidden">
                    <div class="absolute right-0 top-0 p-6 opacity-10">
                        <component :is="lucide.User" class="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div class="relative z-10">
                        <div v-if="currentUser?.profile_img"
                            class="w-12 h-12 rounded-xl overflow-hidden mb-4 border border-white/20">
                            <img :src="`${BASE_URL}${currentUser.profile_img}`" alt="Profile"
                                class="w-full h-full object-cover">
                        </div>
                        <div v-else
                            class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                            <component :is="lucide.User" class="w-6 h-6" />
                        </div>
                        <h3 class="text-lg font-bold mb-1">ข้อมูลของคุณ</h3>
                        <div class="space-y-2 mt-4 text-slate-100">
                            <div class="flex justify-between text-sm border-b border-white/10 pb-2">
                                <span class="opacity-70">ตำแหน่ง</span>
                                <span class="font-medium text-right">{{ getPositionName(myEvaluateeInfo?.position_id)
                                    }}</span>
                            </div>
                            <div class="flex justify-between text-sm pt-1">
                                <span class="opacity-70">หน่วยงาน</span>
                                <span class="font-medium text-right">{{
                                    getDepartmentName(myEvaluateeInfo?.department_id) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>