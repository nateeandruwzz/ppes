<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../services/axios'
import { useRouter } from 'vue-router'
import * as lucide from 'lucide-vue-next'
import { useAuthStore } from '../../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// State
const isLoading = ref(true)
const periods = ref([])
const assignments = ref([])
const evaluations = ref([])
const indicators = ref([])
const users = ref([])

// Computed Stats
const activePeriod = computed(() => {
    const now = new Date()
    return periods.value.find(p => {
        const start = new Date(p.start_date)
        const end = new Date(p.end_date)
        return now >= start && now <= end
    }) || periods.value[0]
})

const myAssignments = computed(() => {
    if (!currentUser.value || !activePeriod.value) return []
    return assignments.value.filter(a =>
        a.committee_user_id === currentUser.value.id &&
        a.period_id == activePeriod.value.id
    )
})

const totalEvaluatees = computed(() => myAssignments.value.length)

const completedCount = computed(() => {
    const periodInds = indicators.value.filter(i => i.period_id == activePeriod.value?.id)
    if (periodInds.length === 0) return 0

    // นับจำนวนคนที่มี evaluation ครบทุก indicator
    let completedUsers = 0
    myAssignments.value.forEach(assign => {
        const userEvals = evaluations.value.filter(e =>
            e.evaluatee_id == assign.evaluatee_id &&
            e.period_id == assign.period_id &&
            e.committee_user_id == currentUser.value.id
        )
        if (userEvals.length >= periodInds.length) {
            completedUsers++
        }
    })
    return completedUsers
})

const progress = computed(() => {
    if (totalEvaluatees.value === 0) return 0
    return Math.round((completedCount.value / totalEvaluatees.value) * 100)
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

// Actions
const goToEvaluate = () => {
    router.push('/committee/evaluate')
}

// API Calls
const loadData = async () => {
    isLoading.value = true
    try {
        const [periodRes, assignRes, evalRes, indicatorRes, userRes] = await Promise.all([
            api.get('/period'),
            api.get('/committee'),
            api.get('/evaluation'),
            api.get('/indicator'),
            api.get('/user')
        ])

        if (periodRes.data.status === 1) periods.value = periodRes.data.data
        if (assignRes.data.status === 1) assignments.value = assignRes.data.data
        if (evalRes.data.status === 1) evaluations.value = evalRes.data.data
        if (indicatorRes.data.status === 1) indicators.value = indicatorRes.data.data
        if (userRes.data.status === 1) users.value = userRes.data.data

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
    <div class="space-y-8 py-5 px-5 md:px-15">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-zinc-800">
                    สวัสดีกรรมการ, {{ currentUser?.first_name }} {{ currentUser?.last_name }} 👋
                </h1>
                <p class="text-zinc-500 mt-1">ภาพรวมการประเมินที่คุณได้รับมอบหมาย</p>
            </div>
            <div class="text-right hidden md:block">
                <p class="text-sm font-medium text-zinc-900">{{ new Date().toLocaleDateString('th-TH', {
                    weekday:
                        'long', day: 'numeric', month: 'long', year: 'numeric'
                }) }}</p>
            </div>
        </div>

        <!-- Content -->
        <div v-if="isLoading" class="grid gap-6 md:grid-cols-3 animate-pulse">
            <div class="h-32 bg-zinc-100 rounded-2xl"></div>
            <div class="h-32 bg-zinc-100 rounded-2xl"></div>
            <div class="h-32 bg-zinc-100 rounded-2xl"></div>
        </div>

        <div v-else class="space-y-8">
            <!-- Stats Grid -->
            <div class="grid md:grid-cols-3 gap-6">
                <!-- Total Assignments -->
                <div
                    class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 relative overflow-hidden text-white group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.Users" class="w-24 h-24 transform translate-x-2 -translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-blue-100 font-medium">บุคลากรที่ต้องประเมิน</p>
                        <h3 class="text-4xl font-bold mt-2">{{ totalEvaluatees }}</h3>
                        <p class="text-xs text-blue-100/80 mt-1">ในรอบ {{ activePeriod?.name || 'ปัจจุบัน' }}</p>
                    </div>
                </div>

                <!-- Completed -->
                <div
                    class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 relative overflow-hidden text-white group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.CheckCircle" class="w-24 h-24 transform translate-x-2 -translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-emerald-100 font-medium">ประเมินเสร็จแล้ว</p>
                        <h3 class="text-4xl font-bold mt-2">{{ completedCount }}</h3>
                        <p class="text-xs text-emerald-100/80 mt-1">คน</p>
                    </div>
                </div>

                <!-- Pending -->
                <div
                    class="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-500/20 relative overflow-hidden text-white group transition-all duration-300">
                    <div class="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <component :is="lucide.Clock" class="w-24 h-24 transform translate-x-2 -translate-y-1.5" />
                    </div>
                    <div class="relative z-10">
                        <p class="text-orange-100 font-medium">รอดำเนินการ</p>
                        <h3 class="text-4xl font-bold mt-2">{{ totalEvaluatees - completedCount }}</h3>
                        <p class="text-xs text-orange-100/80 mt-1">คน</p>
                    </div>
                </div>
            </div>

            <!-- Main Action Card -->
            <div
                class="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                <div class="absolute top-15 right-10 p-8 opacity-10">
                    <component :is="lucide.ClipboardCheck" class="w-44 h-44 transform translate-x-16 -translate-y-16" />
                </div>

                <div class="relative z-10 max-w-2xl">
                    <h2 class="text-2xl md:text-3xl font-bold mb-4">ดำเนินการประเมินบุคลากร</h2>
                    <p class="text-indigo-100 mb-8 text-lg opacity-90">
                        คุณมีรายชื่อที่ต้องทำการประเมินในรอบ {{ activePeriod?.name }} จำนวน {{ totalEvaluatees -
                            completedCount }} ท่าน
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <button @click="goToEvaluate"
                            class="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <component :is="lucide.Play" class="w-5 h-5 fill-current" />
                            เริ่มการประเมิน
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>