<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../../store/authStore'
import Loading from '../../components/Loading.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// Get params
const periodId = computed(() => route.params.periodId)
const evaluateeId = computed(() => route.params.evaluateeId)

// State
const isLoading = ref(true)
const isSaving = ref(false)
const evaluateeInfo = ref(null)
const scores = ref({ selfScore: '0', committeeScore: '0', averageScore: '0' })
const period = ref(null)
const committeeInfo = ref(null)

// Signature - เปลี่ยนเป็น Input ชื่อ
const chairmanName = ref('')

// Computed
const isChairman = computed(() => {
    return committeeInfo.value?.role === 'Chairman' || committeeInfo.value !== null
})

// Save & Submit
const handleSubmit = async () => {
    if (!chairmanName.value.trim() && isChairman.value) {
        toast.error('กรุณากรอกชื่อประธานกรรมการ')
        return
    }

    isSaving.value = true
    try {
        const resultPayload = {
            period_id: periodId.value,
            evaluatee_id: evaluateeId.value,
            total_score: scores.value.averageScore,
            average_score: scores.value.committeeScore
        }

        await api.post('/evaluationResult/summarize', resultPayload)

        const summaryPayload = {
            period_id: periodId.value,
            evaluatee_id: evaluateeId.value,
            committee_user_id: currentUser.value.id,
            summary: JSON.stringify({
                ...scores.value,
                chairman_name: chairmanName.value,
                confirmed_at: new Date().toISOString()
            }),
            signature_path: chairmanName.value // เก็บชื่อแทน path
        }

        await api.post('/committeeSummary', summaryPayload)

        toast.success('บันทึกผลการประเมินสำเร็จ!')
        router.push('/committee/evaluate')

    } catch (error) {
        console.error('Error saving result:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
        isSaving.value = false
    }
}

// Export PDF
const handleExport = () => {
    window.print()
}

// Load Data
const loadData = async () => {
    isLoading.value = true
    try {
        const [summaryRes, periodRes, commInfoRes] = await Promise.all([
            api.get(`/evaluationResult/summary/${periodId.value}/${evaluateeId.value}`),
            api.get(`/period/${periodId.value}`),
            api.get('/committee')
        ])

        if (summaryRes.data.status === 1) {
            evaluateeInfo.value = summaryRes.data.data.evaluatee
            scores.value = summaryRes.data.data.scores
        }
        if (periodRes.data.status === 1) period.value = periodRes.data.data
        if (commInfoRes.data.status === 1) {
            committeeInfo.value = commInfoRes.data.data.find(c =>
                c.committee_user_id === currentUser.value?.id &&
                c.evaluatee_id == evaluateeId.value &&
                c.period_id == periodId.value
            )
        }

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

<template>
    <div class="py-5 px-5 md:px-15">
        <!-- Loading -->
        <!-- Loading -->
        <Loading v-if="isLoading" />

        <div v-else class="space-y-6">
            <!-- Header Info -->
            <div class="bg-white rounded-xl border border-zinc-200 p-5">
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-100 pb-4">
                    <div class="flex items-center gap-3">
                        <button @click="router.back()"
                            class="p-2 hover:bg-zinc-100 rounded-full transition-colors print:hidden">
                            <component :is="lucide.ArrowLeft" class="w-5 h-5 text-zinc-500" />
                        </button>
                        <div>
                            <h1 class="text-xl font-bold text-zinc-900">สรุปผลการประเมิน</h1>
                            <p class="text-xs text-zinc-500 mt-1">ตรวจสอบคะแนนและลงนามยืนยัน</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="handleExport"
                            class="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors print:hidden">
                            <component :is="lucide.FileDown" class="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <!-- ข้อมูลผู้ถูกประเมิน -->
                <div class="flex items-center justify-between gap-6">
                    <!-- ข้อมูลส่วนตัว -->
                    <div class="flex items-center gap-8">
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">ผู้รับการประเมิน</span>
                            <div class="font-bold text-base text-zinc-900">{{ evaluateeInfo?.name || '-' }}</div>
                        </div>
                        <div class="h-8 w-px bg-zinc-200"></div>
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">ตำแหน่ง</span>
                            <div class="font-medium text-sm text-zinc-700">{{ evaluateeInfo?.position || '-' }}</div>
                        </div>
                        <div class="h-8 w-px bg-zinc-200"></div>
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">หน่วยงาน</span>
                            <div class="font-medium text-sm text-zinc-700">{{ evaluateeInfo?.department || '-' }}</div>
                        </div>
                    </div>
                    <!-- รูปโปรไฟล์ -->
                    <div
                        class="w-24 h-24 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border-4 border-amber-50 shrink-0">
                        <component :is="lucide.User" class="w-12 h-12" />
                    </div>
                </div>
            </div>

            <!-- Score Summary -->
            <div class="bg-white rounded-2xl border border-zinc-200 p-6">
                <h2 class="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                    <component :is="lucide.BarChart3" class="w-5 h-5 text-sky-500" />
                    สรุปคะแนน
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-amber-50 rounded-xl p-4 text-center">
                        <p class="text-sm text-amber-700">คะแนนประเมินตนเอง</p>
                        <p class="text-2xl font-bold text-amber-600 mt-1">{{ scores.selfScore }}</p>
                    </div>
                    <div class="bg-sky-50 rounded-xl p-4 text-center">
                        <p class="text-sm text-sky-700">คะแนนจากกรรมการ</p>
                        <p class="text-2xl font-bold text-sky-600 mt-1">{{ scores.committeeScore }}</p>
                    </div>
                    <div class="bg-emerald-50 rounded-xl p-4 text-center">
                        <p class="text-sm text-emerald-700">คะแนนเฉลี่ยรวม</p>
                        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ scores.averageScore }}</p>
                    </div>
                </div>
            </div>

            <!-- Chairman Signature Section -->
            <div v-if="isChairman" class="bg-white rounded-2xl border border-zinc-200 p-6 print:hidden">
                <h2 class="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                    <component :is="lucide.PenTool" class="w-5 h-5 text-sky-500" />
                    ลงนามประธานกรรมการ
                </h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-2">
                            ชื่อ-นามสกุล ประธานกรรมการ
                        </label>
                        <input v-model="chairmanName" type="text" placeholder="กรอกชื่อ-นามสกุลเพื่อยืนยันการลงนาม"
                            class="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-lg" />
                    </div>
                    <p class="text-sm text-zinc-500 flex items-center gap-1">
                        <component :is="lucide.Info" class="w-4 h-4" />
                        การกรอกชื่อถือเป็นการยืนยันและลงนามผลการประเมิน
                    </p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 print:hidden">
                <button @click="router.back()"
                    class="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-200 transition-colors">
                    ยกเลิก
                </button>
                <button v-if="isChairman" @click="handleSubmit" :disabled="isSaving || !chairmanName.trim()"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <component :is="isSaving ? lucide.Loader2 : lucide.CheckCircle"
                        :class="['w-5 h-5', isSaving && 'animate-spin']" />
                    {{ isSaving ? 'กำลังบันทึก...' : 'ยืนยันและบันทึกผล' }}
                </button>
            </div>
        </div>
    </div>
</template>
