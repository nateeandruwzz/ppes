<template>
    <div class="py-5 px-5 md:px-15">
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>

        <div v-else-if="isError"
            class="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-center shadow-sm">
            <h3 class="font-bold text-lg mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
            <p class="text-sm">กรุณาลองใหม่อีกครั้ง</p>
            <button @click="router.back()"
                class="mt-4 px-4 py-2 bg-zinc-100 rounded-lg text-zinc-700 hover:bg-zinc-200 transition-colors">
                กลับ
            </button>
        </div>

        <div v-else class="space-y-6">
            <!-- Header Info -->
            <div class="bg-white rounded-xl border border-zinc-200 p-5">
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 pb-4">
                    <div class="flex items-center gap-3">
                        <button @click="router.back()" class="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <component :is="lucide.ArrowLeft" class="w-5 h-5 text-zinc-500" />
                        </button>
                        <div>
                            <h1 class="text-xl font-bold text-zinc-900">ประเมินผลการปฏิบัติงานตนเอง</h1>
                            <p class="text-xs text-zinc-500 mt-1">กรุณาประเมินตามตัวชี้วัดที่กำหนด</p>
                        </div>
                    </div>
                    <span
                        class="self-start md:self-auto px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-medium">
                        {{ periodName }}
                    </span>
                </div>

                <!-- สถานะ -->
                <div class="flex items-center gap-4">
                    <span :class="getStatusClass()"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                        {{ getStatusLabel() }}
                    </span>
                    <span class="text-sm text-zinc-500">
                        ประเมินแล้ว {{ completedCount }} / {{ periodIndicators.length }} ข้อ
                    </span>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="periodIndicators.length === 0"
                class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
                <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <component :is="lucide.FileQuestion" class="w-8 h-8 text-zinc-400" />
                </div>
                <h3 class="font-medium text-zinc-900">ไม่มีตัวชี้วัดในรอบนี้</h3>
                <p class="text-sm text-zinc-500">กรุณาติดต่อ HR</p>
            </div>

            <!-- Indicators Loop -->
            <div v-else>
                <div v-for="(indicator, index) in periodIndicators" :key="indicator.id"
                    class="rounded-2xl bg-white border border-zinc-200 overflow-hidden mb-4">
                    <div
                        class="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-start gap-3">
                            <div class="bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
                                ข้อที่ {{ index + 1 }}
                            </div>
                            <h3 class="font-semibold text-zinc-900 text-lg leading-snug">{{ indicator.name }}</h3>
                        </div>
                        <span
                            class="whitespace-nowrap px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-600 text-sm font-semibold">
                            {{ indicator.weight }} คะแนน
                        </span>
                    </div>

                    <div class="p-6">
                        <!-- Description -->
                        <p v-if="indicator.description"
                            class="text-zinc-600 mb-6 bg-zinc-50 p-4 rounded-xl text-sm leading-relaxed">
                            {{ indicator.description }}
                        </p>

                        <div class="space-y-6">
                            <!-- Scale Selection -->
                            <div class="space-y-4">
                                <h4 class="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                                    <component :is="lucide.Star" class="w-4 h-4 text-yellow-500" />
                                    ให้คะแนนตนเอง <span class="text-red-500">*</span>
                                </h4>

                                <div class="flex flex-wrap gap-2">
                                    <button v-for="scale in periodScales" :key="scale.id" type="button"
                                        class="group relative flex-1 min-w-[80px] p-3 rounded-xl border-2 transition-all duration-200 text-center focus:outline-none"
                                        :class="getScore(indicator.id) === scale.value
                                            ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20 scale-105 z-10'
                                            : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'"
                                        @click="setScore(indicator.id, scale.value)">
                                        <div class="text-lg font-bold mb-1">{{ scale.value }}</div>
                                        <div class="text-[10px] uppercase tracking-wider opacity-80">{{ scale.name }}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <!-- Comment -->
                            <div class="space-y-4">
                                <h4 class="font-semibold text-sm text-zinc-900">เหตุผลประกอบ / หลักฐาน</h4>
                                <div class="relative">
                                    <textarea :value="getComment(indicator.id)"
                                        @input="e => setComment(indicator.id, e.target.value)"
                                        placeholder="อธิบายเหตุผลที่ให้คะแนนนี้..."
                                        class="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-sm resize-none outline-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Score Summary Table -->
                <div class="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
                    <div class="bg-zinc-50/50 p-6 border-b border-zinc-100 flex items-center gap-2">
                        <div class="p-2 bg-sky-100 rounded-lg text-sky-500">
                            <component :is="lucide.Table" class="w-5 h-5" />
                        </div>
                        <h2 class="text-lg font-bold text-zinc-900">ตารางสรุปผลการประเมินตนเอง</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                                <tr>
                                    <th class="py-4 px-6 w-16">#</th>
                                    <th class="py-4 px-6">ตัวชี้วัด</th>
                                    <th class="py-4 px-6 text-center w-24">น้ำหนักคะแนน</th>
                                    <th class="py-4 px-6 text-center w-32">คะแนนที่ได้</th>
                                    <th class="py-4 px-6 text-center w-32">คะแนนจริง</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100">
                                <tr v-for="(indicator, index) in periodIndicators" :key="indicator.id"
                                    class="hover:bg-zinc-50/50 transition-colors">
                                    <td class="py-4 px-6 text-zinc-400 font-medium">{{ index + 1 }}</td>
                                    <td class="py-4 px-6 text-zinc-900 font-medium">{{ indicator.name }}</td>
                                    <td class="py-4 px-6 text-center text-zinc-500">{{ indicator.weight }}</td>
                                    <td class="py-4 px-6 text-center">
                                        <span v-if="getScore(indicator.id) !== null" class="font-bold text-sky-600">
                                            {{ getScore(indicator.id) }}
                                        </span>
                                        <span v-else class="text-zinc-6
                                        00 font-semibold">-</span>
                                    </td>
                                    <td class="py-4 px-6 text-center font-bold text-zinc-900">
                                        {{ calculateWeightedScore(getScore(indicator.id), indicator.weight) }}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-zinc-50 border-t border-zinc-200">
                                <tr>
                                    <td colspan="2" class="py-4 px-6 font-bold text-zinc-900 text-right">รวมคะแนนทั้งหมด
                                    </td>
                                    <td class="py-4 px-6 text-center font-bold text-zinc-700">{{ totalWeight.toFixed(2) }}</td>
                                    <td class="py-4 px-6"></td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="text-xl font-bold text-sky-600">{{ totalScore }}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Sticky Footer Action Bar -->
    <div
        class="sticky bottom-0 left-0 right-0 z-40 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 mt-8">
        <div class="flex items-center justify-between max-w-7xl mx-auto">
            <div class="hidden md:block text-sm text-zinc-500">
                <span v-if="hasUnsavedChanges" class="text-amber-500 flex items-center gap-2">
                    <component :is="lucide.AlertCircle" class="w-4 h-4" /> มีการแก้ไขที่ยังไม่ได้บันทึก
                </span>
                <span v-else class="text-green-600 flex items-center gap-2">
                    <component :is="lucide.CheckCircle" class="w-4 h-4" /> พร้อมบันทึก
                </span>
            </div>

            <div class="flex items-center gap-3 w-full md:w-auto ml-auto">
                <button @click="router.back()"
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium transition-colors">
                    ยกเลิก
                </button>
                <button @click="handleSubmit" :disabled="isSaving"
                    class="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-white bg-sky-500 hover:bg-sky-600 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <component :is="isSaving ? lucide.Loader2 : lucide.Send"
                        :class="['w-4 h-4', isSaving && 'animate-spin']" />
                    {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกการประเมิน' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../../store/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// Get Period ID from route
const periodId = computed(() => route.params.periodId)

// State
const myEvaluateeInfo = ref(null)
const indicators = ref([])
const scales = ref([])
const period = ref(null)
const selfEvaluations = ref([])
const isLoading = ref(false)
const isError = ref(false)
const isSaving = ref(false)
const hasUnsavedChanges = ref(false)

// Form Data
const formData = reactive({
    scores: {}
})

// Computed
const periodIndicators = computed(() => {
    return indicators.value.filter(i => i.period_id == periodId.value)
})

const periodScales = computed(() => {
    return scales.value.filter(s => s.period_id == periodId.value).sort((a, b) => b.value - a.value)
})

const periodName = computed(() => {
    return period.value?.name || 'กำลังโหลด...'
})

const maxScale = computed(() => {
    if (periodScales.value.length === 0) return 5
    return Math.max(...periodScales.value.map(s => s.value))
})

const totalWeight = computed(() => {
    return periodIndicators.value.reduce((sum, ind) => sum + Number(ind.weight || 0), 0)
})

const totalScore = computed(() => {
    return periodIndicators.value.reduce((sum, ind) => {
        const s = getScore(ind.id)
        if (s === null || s === undefined) return sum
        return sum + ((s / maxScale.value) * Number(ind.weight || 0))
    }, 0).toFixed(2)
})

const completedCount = computed(() => {
    return periodIndicators.value.filter(ind => getScore(ind.id) !== null).length
})

// Getters/Setters
const getScore = (indicatorId) => {
    return formData.scores[indicatorId]?.score ?? null
}

const getComment = (indicatorId) => {
    return formData.scores[indicatorId]?.comment ?? ''
}

const setScore = (indicatorId, scoreVal) => {
    if (!formData.scores[indicatorId]) {
        formData.scores[indicatorId] = { score: null, comment: '' }
    }
    formData.scores[indicatorId].score = scoreVal
    hasUnsavedChanges.value = true
}

const setComment = (indicatorId, commentVal) => {
    if (!formData.scores[indicatorId]) {
        formData.scores[indicatorId] = { score: null, comment: '' }
    }
    formData.scores[indicatorId].comment = commentVal
    hasUnsavedChanges.value = true
}

const calculateWeightedScore = (score, weight) => {
    if (score === null || score === undefined) return '-'
    const val = (score / maxScale.value) * weight
    return val.toFixed(2)
}

// Helpers
const getStatusLabel = () => {
    const total = periodIndicators.value.length
    const completed = completedCount.value
    if (completed === 0) return 'รอการประเมิน'
    if (completed >= total) return 'ประเมินครบแล้ว'
    return `กำลังดำเนินการ (${completed}/${total})`
}

const getStatusClass = () => {
    const label = getStatusLabel()
    if (label.includes('ประเมินครบแล้ว')) return 'bg-green-50 text-green-700'
    if (label.includes('กำลังดำเนินการ')) return 'bg-amber-50 text-amber-700'
    return 'bg-zinc-100 text-zinc-600'
}

// Init Form Data
const initFormData = () => {
    if (!myEvaluateeInfo.value) return

    periodIndicators.value.forEach(ind => {
        const existing = selfEvaluations.value.find(e =>
            e.period_id == periodId.value &&
            e.evaluatee_id == myEvaluateeInfo.value.id &&
            e.indicator_id == ind.id
        )

        formData.scores[ind.id] = {
            score: existing ? Number(existing.score) : null,
            comment: existing ? existing.comment : '',
            existing_id: existing ? existing.id : null
        }
    })

    hasUnsavedChanges.value = false
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

const fetchScales = async () => {
    const response = await api.get('/scale')
    if (response.data.status === 1) {
        scales.value = response.data.data
    }
}

const fetchPeriod = async () => {
    const response = await api.get(`/period/${periodId.value}`)
    if (response.data.status === 1) {
        period.value = response.data.data
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

// Submit
const handleSubmit = async () => {
    if (!myEvaluateeInfo.value) {
        toast.error('ไม่พบข้อมูลผู้ถูกประเมิน')
        return
    }

    // Validation
    const missingScores = periodIndicators.value.filter(ind => getScore(ind.id) === null)
    if (missingScores.length > 0) {
        toast.error(`กรุณาให้คะแนนให้ครบทุกข้อ (ขาด ${missingScores.length} ข้อ)`)
        return
    }

    isSaving.value = true
    try {
        for (const indicator of periodIndicators.value) {
            const data = formData.scores[indicator.id]
            const payload = {
                period_id: periodId.value,
                evaluatee_id: myEvaluateeInfo.value.id,
                indicator_id: indicator.id,
                score: Number(data.score),
                comment: data.comment || ''
            }

            if (data.existing_id) {
                await api.put(`/selfEvaluation/${data.existing_id}`, payload)
            } else {
                await api.post('/selfEvaluation', payload)
            }
        }

        toast.success('บันทึกการประเมินตนเองเรียบร้อยแล้ว')
        hasUnsavedChanges.value = false
        router.push('/evaluatee/self-evaluate')
    } catch (error) {
        console.error('Error saving evaluation:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
        isSaving.value = false
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
            fetchScales(),
            fetchPeriod(),
            fetchSelfEvaluations()
        ])
        initFormData()
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

// Watch for indicator changes to init form
watch(periodIndicators, () => {
    if (myEvaluateeInfo.value) {
        initFormData()
    }
})
</script>
