<template>
    <div class="py-5 px-5 md:px-15">
        <Loading v-if="isLoading" />

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

                <!-- ข้อมูลผู้ประเมิน-->
                <div class="flex items-center justify-between gap-6 px-4 py-4 border-b border-zinc-100 mb-4">
                    <!-- ข้อมูลส่วนตัว -->
                    <div class="flex items-center gap-8">
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">ผู้ประเมิน</span>
                            <div class="font-bold text-base text-zinc-900">{{ currentUser?.first_name }} {{
                                currentUser?.last_name }}</div>
                        </div>
                        <div class="h-8 w-px bg-zinc-200"></div>
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">ตำแหน่ง</span>
                            <div class="font-medium text-sm text-zinc-700">{{ userPosition }}</div>
                        </div>
                        <div class="h-8 w-px bg-zinc-200"></div>
                        <div>
                            <span class="text-xs text-zinc-500 block mb-1">หน่วยงาน</span>
                            <div class="font-medium text-sm text-zinc-700">{{ userDepartment }}</div>
                        </div>
                    </div>
                    <!-- รูปโปรไฟล์ (ขวา) - สี่เหลี่ยม -->
                    <div
                        class="w-24 h-24 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border-4 border-amber-50 shrink-0">
                        <component :is="lucide.User" class="w-12 h-12" />
                    </div>
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

                            <!-- Evidence Attachment -->
                            <div v-if="indicator.required_evidence" class="space-y-4 pt-4 border-t border-zinc-100">
                                <h4 class="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                                    <component :is="lucide.Paperclip" class="w-4 h-4 text-zinc-500" />
                                    แนบหลักฐาน <span class="text-red-500">*</span>
                                </h4>

                                <!-- Evidence Type Toggle -->
                                <div class="flex gap-2 mb-3">
                                    <button type="button" @click="setEvidenceType(indicator.id, 'file')" :class="getEvidenceType(indicator.id) === 'file'
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                        <component :is="lucide.FileUp" class="w-3.5 h-3.5" />
                                        อัปโหลดไฟล์
                                    </button>
                                    <button type="button" @click="setEvidenceType(indicator.id, 'url')" :class="getEvidenceType(indicator.id) === 'url'
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                        <component :is="lucide.Link" class="w-3.5 h-3.5" />
                                        ใส่ลิงก์ URL
                                    </button>
                                </div>

                                <!-- File Upload Mode -->
                                <div v-if="getEvidenceType(indicator.id) === 'file'" class="space-y-2">
                                    <div v-if="!getEvidenceFile(indicator.id)">
                                        <label :for="`file-${indicator.id}`"
                                            class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                            <component :is="lucide.Upload" class="w-6 h-6 text-zinc-400 mb-2" />
                                            <span class="text-sm text-zinc-500">คลิกเพื่อเลือกไฟล์</span>
                                            <span class="text-xs text-zinc-400 mt-1">(รูปภาพ, PDF, Word, Excel สูงสุด
                                                10MB)</span>
                                        </label>
                                        <input :id="`file-${indicator.id}`" type="file"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            @change="e => handleFileSelect(indicator.id, e)" class="hidden" />
                                    </div>

                                    <!-- Show uploaded file or existing evidence -->
                                    <div v-else class="p-3 bg-green-50 border border-green-200 rounded-xl">
                                        <!-- แสดงตัวอย่างรูปภาพ (ถ้าเป็นรูป) -->
                                        <div v-if="isImageFile(getEvidenceFile(indicator.id))" class="mb-2">
                                            <img :src="getImagePreviewUrl(indicator.id)"
                                                class="max-h-32 rounded-lg object-contain" alt="หลักฐาน" />
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <component :is="lucide.FileCheck" class="w-5 h-5 text-green-600 shrink-0" />
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium text-green-800 truncate">
                                                    {{ getEvidenceFileName(indicator.id) }}
                                                </p>
                                                <a v-if="getEvidenceFilePath(indicator.id)"
                                                    :href="getFullFileUrl(indicator.id)" target="_blank"
                                                    class="text-xs text-sky-600 hover:underline">
                                                    คลิกเพื่อดูไฟล์
                                                </a>
                                                <span v-else class="text-xs text-green-600">อัปโหลดแล้ว</span>
                                            </div>
                                            <button type="button" @click="clearEvidence(indicator.id)"
                                                class="p-1.5 hover:bg-green-100 rounded-lg transition-colors">
                                                <component :is="lucide.X" class="w-4 h-4 text-green-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- URL Input Mode -->
                                <div v-else class="space-y-2">
                                    <input type="url" :value="getEvidenceUrl(indicator.id)"
                                        @input="e => setEvidenceUrl(indicator.id, e.target.value)"
                                        placeholder="https://example.com/evidence.pdf"
                                        class="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-sm outline-none" />
                                    <p class="text-xs text-zinc-400">ใส่ลิงก์ไปยังไฟล์หลักฐาน (Google Drive, Dropbox,
                                        เว็บไซต์ ฯลฯ)</p>
                                </div>

                                <!-- Evidence Description -->
                                <input type="text" :value="getEvidenceDescription(indicator.id)"
                                    @input="e => setEvidenceDescription(indicator.id, e.target.value)"
                                    placeholder="คำอธิบายหลักฐาน (ถ้ามี)"
                                    class="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-sm outline-none" />
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
                                    <td class="py-4 px-6 text-center font-bold text-zinc-700">{{ totalWeight.toFixed(2)
                                        }}</td>
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
    <div class="sticky bottom-0 left-0 right-0 z-40 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 mt-8">
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
import Loading from '../../components/Loading.vue'
import { BASE_URL } from '../../config'

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
    scores: {},
    evidences: {}
})

// Evidence Getters/Setters
const getEvidenceType = (indicatorId) => {
    return formData.evidences[indicatorId]?.type ?? 'file'
}

const setEvidenceType = (indicatorId, type) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', file: null, filePath: '', url: '', description: '' }
    }
    formData.evidences[indicatorId].type = type
    hasUnsavedChanges.value = true
}

const getEvidenceFile = (indicatorId) => {
    const evidence = formData.evidences[indicatorId]
    return evidence?.file || evidence?.filePath || null
}

const getEvidenceUrl = (indicatorId) => {
    return formData.evidences[indicatorId]?.url ?? ''
}

const setEvidenceUrl = (indicatorId, url) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'url', file: null, filePath: '', url: '', description: '' }
    }
    formData.evidences[indicatorId].url = url
    hasUnsavedChanges.value = true
}

const getEvidenceDescription = (indicatorId) => {
    return formData.evidences[indicatorId]?.description ?? ''
}

const setEvidenceDescription = (indicatorId, desc) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', file: null, filePath: '', url: '', description: '' }
    }
    formData.evidences[indicatorId].description = desc
    hasUnsavedChanges.value = true
}

const handleFileSelect = (indicatorId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', file: null, filePath: '', url: '', description: '' }
    }
    formData.evidences[indicatorId].file = file
    formData.evidences[indicatorId].filePath = '' // Clear old path when new file selected
    hasUnsavedChanges.value = true
}

const clearEvidence = (indicatorId) => {
    if (formData.evidences[indicatorId]) {
        formData.evidences[indicatorId].file = null
        formData.evidences[indicatorId].filePath = ''
        formData.evidences[indicatorId].url = ''
    }
    hasUnsavedChanges.value = true
}

// ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
const isImageFile = (fileOrPath) => {
    if (!fileOrPath) return false
    const name = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath.name
    if (!name) return false
    const ext = name.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

// ดึง URL สำหรับแสดง preview รูปภาพ
const getImagePreviewUrl = (indicatorId) => {
    const evidence = formData.evidences[indicatorId]
    if (!evidence) return ''
    if (evidence.file) {
        return URL.createObjectURL(evidence.file)
    }
    if (evidence.filePath) {
        return `${BASE_URL}${evidence.filePath}`
    }
    return ''
}

// ดึงชื่อไฟล์สำหรับแสดง
const getEvidenceFileName = (indicatorId) => {
    const evidence = formData.evidences[indicatorId]
    if (!evidence) return ''
    if (evidence.file) return evidence.file.name
    if (evidence.filePath) return evidence.filePath.split('/').pop()
    return 'ไฟล์ที่อัปโหลด'
}

// ดึง file path ที่บันทึกแล้ว
const getEvidenceFilePath = (indicatorId) => {
    return formData.evidences[indicatorId]?.filePath || ''
}

// ดึง URL สำหรับเปิดไฟล์
const getFullFileUrl = (indicatorId) => {
    const filePath = getEvidenceFilePath(indicatorId)
    if (!filePath) return ''
    return `${BASE_URL}${filePath}`
}

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

        // โหลดหลักฐานที่มีอยู่
        const existingEvidence = existingEvidences.value.find(ev =>
            ev.indicator_id == ind.id
        )

        if (existingEvidence) {
            formData.evidences[ind.id] = {
                type: existingEvidence.url ? 'url' : 'file',
                file: null,
                filePath: existingEvidence.file_path || '',
                url: existingEvidence.url || '',
                description: existingEvidence.description || '',
                existing_id: existingEvidence.id
            }
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
    // ใช้ API ที่ filter ตาม period โดยตรงจาก Backend
    const url = periodId.value ? `/indicator/period/${periodId.value}` : '/indicator'
    const response = await api.get(url)
    if (response.data.status === 1) {
        indicators.value = response.data.data
    } else {
        indicators.value = []
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

// State for existing evidences
const existingEvidences = ref([])

// ดึงหลักฐานที่เคยอัปโหลดไว้
const fetchEvidences = async () => {
    if (!myEvaluateeInfo.value) return
    try {
        const response = await api.get(`/evidence/evaluatee/${myEvaluateeInfo.value.id}`)
        if (response.data.status === 1) {
            existingEvidences.value = response.data.data
        } else {
            existingEvidences.value = []
        }
    } catch (err) {
        console.error('Error fetching evidences:', err)
        existingEvidences.value = []
    }
}

// Submit
const handleSubmit = async () => {
    if (!myEvaluateeInfo.value) {
        toast.error('ไม่พบข้อมูลผู้ถูกประเมิน')
        return
    }

    // Validation - Scores
    const missingScores = periodIndicators.value.filter(ind => getScore(ind.id) === null)
    if (missingScores.length > 0) {
        toast.error(`กรุณาให้คะแนนให้ครบทุกข้อ (ขาด ${missingScores.length} ข้อ)`)
        return
    }

    // Validation - Evidence for required indicators
    const missingEvidence = periodIndicators.value.filter(ind => {
        if (!ind.required_evidence) return false
        const evidence = formData.evidences[ind.id]
        if (!evidence) return true
        if (evidence.type === 'file' && !evidence.file && !evidence.filePath) return true
        if (evidence.type === 'url' && !evidence.url) return true
        return false
    })
    if (missingEvidence.length > 0) {
        toast.error(`กรุณาแนบหลักฐานให้ครบ (ขาด ${missingEvidence.length} ข้อ)`)
        return
    }

    isSaving.value = true
    try {
        // 1. Save Self Evaluations
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

        // 2. Upload Files & Save Evidence for required indicators
        for (const indicator of periodIndicators.value) {
            if (!indicator.required_evidence) continue
            const evidence = formData.evidences[indicator.id]
            if (!evidence) continue

            let file_path = evidence.filePath || ''
            let url = evidence.url || ''

            // If there's a new file to upload
            if (evidence.type === 'file' && evidence.file) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', evidence.file)

                try {
                    const uploadRes = await api.post('/upload', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                    if (uploadRes.data.status === 1) {
                        file_path = uploadRes.data.data.path
                    }
                } catch (uploadErr) {
                    console.error('Upload error:', uploadErr)
                    toast.error(`อัปโหลดไฟล์หลักฐานสำหรับ "${indicator.name}" ล้มเหลว`)
                    continue
                }
            }

            // Save Evidence record
            const evidencePayload = {
                evaluatee_id: myEvaluateeInfo.value.id,
                indicator_id: indicator.id,
                file_path: evidence.type === 'file' ? file_path : null,
                url: evidence.type === 'url' ? url : null,
                description: evidence.description || ''
            }

            // Check if evidence exists (could add update logic here)
            await api.post('/evidence', evidencePayload)
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
        // ต้อง fetch หลักฐานหลังจากได้ myEvaluateeInfo แล้ว
        await fetchEvidences()
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
