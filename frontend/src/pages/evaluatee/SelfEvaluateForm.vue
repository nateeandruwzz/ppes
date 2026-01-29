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
                            <h1 class="text-xl font-bold text-zinc-900">{{ topicName }}</h1>
                            <p class="text-xs text-zinc-500 mt-1">กรุณาประเมินตามตัวชี้วัดที่กำหนด</p>
                        </div>
                    </div>
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
                    <div>
                        <img :src="'http://localhost:4400' + currentUser?.profile_img" alt=""
                            class="w-24 h-24 bg-cover rounded-2xl">
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
                                ตัวชี้วัดที่ {{ index + 1 }}
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

                        <!-- Admin References (Reference Docs) -->
                        <div v-if="indicatorRefs[indicator.id] && indicatorRefs[indicator.id].length > 0" class="mb-6">
                            <h4 class="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
                                <component :is="lucide.BookOpen" class="w-4 h-4 text-indigo-500" />
                                เอกสารประกอบการประเมิน (จากเจ้าหน้าที่)
                            </h4>
                            <div class="space-y-2">
                                <a v-for="ref in indicatorRefs[indicator.id]" :key="ref.id"
                                    :href="ref.ref_type === 'url' ? ref.ref_path : `${BASE_URL}${ref.ref_path}`"
                                    target="_blank"
                                    class="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors group">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                                        <component :is="ref.ref_type === 'url' ? lucide.Link : lucide.FileText"
                                            class="w-4 h-4" />
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-indigo-900">{{ ref.ref_name }}</p>
                                        <p class="text-xs text-indigo-600">{{ ref.ref_type === 'url' ? 'ลิงก์ภายนอก' :
                                            'เอกสารแนบ' }}</p>
                                    </div>
                                    <component :is="lucide.ExternalLink"
                                        class="w-4 h-4 text-indigo-400 group-hover:text-indigo-600" />
                                </a>
                            </div>
                        </div>

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

                            <!-- Evidence Attachment - Show for all indicators -->
                            <div class="space-y-4 pt-4 border-t border-zinc-100">
                                <h4 class="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                                    <component :is="lucide.Paperclip" class="w-4 h-4 text-zinc-500" />
                                    แนบหลักฐาน
                                    <span v-if="indicator.required_evidence" class="text-red-500">*</span>
                                    <span v-else class="text-xs text-zinc-400 font-normal">(ไม่บังคับ)</span>
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

                                <!-- File Upload Mode - Multiple Files -->
                                <div v-if="getEvidenceType(indicator.id) === 'file'" class="space-y-3">
                                    <!-- Upload area -->
                                    <label :for="`file-${indicator.id}`"
                                        class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                        <component :is="lucide.Upload" class="w-5 h-5 text-zinc-400 mb-1" />
                                        <span class="text-sm text-zinc-500">คลิกเพื่อเลือกไฟล์ (เลือกได้หลายไฟล์)</span>
                                        <span class="text-xs text-zinc-400 mt-1">รูปภาพ, PDF, Word, Excel</span>
                                    </label>
                                    <input :id="`file-${indicator.id}`" type="file" multiple
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        @change="e => handleFileSelect(indicator.id, e)" class="hidden" />

                                    <!-- Existing Files List -->
                                    <div v-if="getExistingFiles(indicator.id).length > 0" class="space-y-2">
                                        <p class="text-xs font-medium text-zinc-500">ไฟล์ที่บันทึกแล้ว:</p>
                                        <div v-for="file in getExistingFiles(indicator.id)" :key="file.id"
                                            class="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                                            <component :is="lucide.FileCheck" class="w-4 h-4 text-blue-600 shrink-0" />
                                            <div class="flex-1 min-w-0">
                                                <a :href="getExistingFileUrl(file)" target="_blank"
                                                    class="text-sm font-medium text-blue-700 hover:underline truncate block">
                                                    {{ getFileName(file) }}
                                                </a>
                                            </div>
                                            <button type="button" @click="removeExistingFile(indicator.id, file.id)"
                                                class="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600 hover:text-red-500">
                                                <component :is="lucide.Trash2" class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- New Files List -->
                                    <div v-if="getEvidenceFiles(indicator.id).length > 0" class="space-y-2">
                                        <p class="text-xs font-medium text-zinc-500">ไฟล์ใหม่ที่จะอัปโหลด:</p>
                                        <div v-for="(file, fileIndex) in getEvidenceFiles(indicator.id)"
                                            :key="fileIndex"
                                            class="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                            <!-- Image preview -->
                                            <div v-if="isImageFile(file)"
                                                class="w-10 h-10 rounded overflow-hidden shrink-0">
                                                <img :src="getFilePreviewUrl(file)"
                                                    class="w-full h-full object-cover" />
                                            </div>
                                            <component v-else :is="lucide.FileText"
                                                class="w-4 h-4 text-green-600 shrink-0" />
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium text-green-800 truncate">{{ file.name }}
                                                </p>
                                                <p class="text-xs text-green-600">{{ (file.size / 1024 /
                                                    1024).toFixed(2) }} MB</p>
                                            </div>
                                            <button type="button" @click="removeNewFile(indicator.id, fileIndex)"
                                                class="p-1 hover:bg-green-100 rounded transition-colors text-green-600 hover:text-red-500">
                                                <component :is="lucide.X" class="w-4 h-4" />
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
const indicatorRefs = ref({}) // Store refs by indicator ID
const scales = ref([])
const period = ref(null)
const selfEvaluations = ref([])
const topics = ref([])
const positions = ref([])
const departments = ref([])
const isLoading = ref(false)
const isError = ref(false)
const isSaving = ref(false)
const hasUnsavedChanges = ref(false)

// Form Data
const formData = reactive({
    scores: {},
    evidences: {}
})

// Evidence Getters/Setters - Multiple File Support
const getEvidenceType = (indicatorId) => {
    return formData.evidences[indicatorId]?.type ?? 'file'
}

const setEvidenceType = (indicatorId, type) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', files: [], existingFiles: [], url: '', description: '' }
    }
    formData.evidences[indicatorId].type = type
    hasUnsavedChanges.value = true
}

// Get all files (new + existing) for an indicator
const getEvidenceFiles = (indicatorId) => {
    const evidence = formData.evidences[indicatorId]
    if (!evidence) return []
    return evidence.files || []
}

const getExistingFiles = (indicatorId) => {
    const evidence = formData.evidences[indicatorId]
    if (!evidence) return []
    return evidence.existingFiles || []
}

const hasAnyFiles = (indicatorId) => {
    return getEvidenceFiles(indicatorId).length > 0 || getExistingFiles(indicatorId).length > 0
}

const getEvidenceUrl = (indicatorId) => {
    return formData.evidences[indicatorId]?.url ?? ''
}

const setEvidenceUrl = (indicatorId, url) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'url', files: [], existingFiles: [], url: '', description: '' }
    }
    formData.evidences[indicatorId].url = url
    hasUnsavedChanges.value = true
}

const getEvidenceDescription = (indicatorId) => {
    return formData.evidences[indicatorId]?.description ?? ''
}

const setEvidenceDescription = (indicatorId, desc) => {
    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', files: [], existingFiles: [], url: '', description: '' }
    }
    formData.evidences[indicatorId].description = desc
    hasUnsavedChanges.value = true
}

// Handle multiple file selection
const handleFileSelect = (indicatorId, event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    if (!formData.evidences[indicatorId]) {
        formData.evidences[indicatorId] = { type: 'file', files: [], existingFiles: [], url: '', description: '' }
    }

    // Append new files to existing array
    formData.evidences[indicatorId].files.push(...selectedFiles)
    hasUnsavedChanges.value = true

    // Reset input so same file can be selected again
    event.target.value = ''
}

// Remove a new file from the list
const removeNewFile = (indicatorId, fileIndex) => {
    if (formData.evidences[indicatorId]?.files) {
        formData.evidences[indicatorId].files.splice(fileIndex, 1)
        hasUnsavedChanges.value = true
    }
}

// Remove an existing file (mark for deletion)
const removeExistingFile = async (indicatorId, evidenceId) => {
    try {
        await api.delete(`/evidence/${evidenceId}`)
        if (formData.evidences[indicatorId]?.existingFiles) {
            formData.evidences[indicatorId].existingFiles = formData.evidences[indicatorId].existingFiles.filter(f => f.id !== evidenceId)
        }
        toast.success('ลบหลักฐานเรียบร้อย')
    } catch (err) {
        console.error('Error deleting evidence:', err)
        toast.error('ไม่สามารถลบหลักฐานได้')
    }
}

// ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
const isImageFile = (fileOrPath) => {
    if (!fileOrPath) return false
    const name = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath.name
    if (!name) return false
    const ext = name.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

// Get preview URL for a file
const getFilePreviewUrl = (file) => {
    if (file instanceof File) {
        return URL.createObjectURL(file)
    }
    return null
}

// Get file name
const getFileName = (file) => {
    if (file instanceof File) return file.name
    if (typeof file === 'object' && file.file_path) {
        return file.file_path.split('/').pop()
    }
    return 'ไฟล์'
}

// Get file url for existing files
const getExistingFileUrl = (file) => {
    if (file && file.file_path) {
        return `${BASE_URL}${file.file_path}`
    }
    return ''
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

const topicName = computed(() => {
    if (periodIndicators.value.length === 0 || topics.value.length === 0) return ''
    const topicId = periodIndicators.value[0].topic_id
    const topic = topics.value.find(t => t.id === topicId)
    return topic ? topic.name : ''
})

const userPosition = computed(() => {
    if (!myEvaluateeInfo.value || positions.value.length === 0) return '-'
    const pos = positions.value.find(p => p.id === myEvaluateeInfo.value.position_id)
    return pos ? pos.name : '-'
})

const userDepartment = computed(() => {
    if (!myEvaluateeInfo.value || departments.value.length === 0) return '-'
    const dept = departments.value.find(d => d.id === myEvaluateeInfo.value.department_id)
    return dept ? dept.name : '-'
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

        // โหลดหลักฐานที่มีอยู่ (หลายไฟล์)
        const indicatorEvidences = existingEvidences.value.filter(ev =>
            ev.indicator_id == ind.id
        )

        formData.evidences[ind.id] = {
            type: 'file',
            files: [], // New files to upload
            existingFiles: indicatorEvidences, // Existing files from DB
            url: indicatorEvidences.find(e => e.url)?.url || '',
            description: indicatorEvidences[0]?.description || ''
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
    // Fetch References for indicators
    if (indicators.value.length > 0) {
        for (const ind of indicators.value) {
            try {
                const refRes = await api.get(`/indicator-reference/indicator/${ind.id}`)
                if (refRes.data.status === 1) {
                    indicatorRefs.value[ind.id] = refRes.data.data
                }
            } catch (e) {
                console.error('Fetch ref error', e)
            }
        }
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

const fetchTopics = async () => {
    const response = await api.get('/topic')
    if (response.data.status === 1) {
        topics.value = response.data.data
    }
}

const fetchPositions = async () => {
    const response = await api.get('/position')
    if (response.data.status === 1) {
        positions.value = response.data.data
    }
}

const fetchDepartments = async () => {
    const response = await api.get('/department')
    if (response.data.status === 1) {
        departments.value = response.data.data
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

    // Validation - Evidence for required indicators (must have at least 1 file)
    const missingEvidence = periodIndicators.value.filter(ind => {
        if (!ind.required_evidence) return false
        const evidence = formData.evidences[ind.id]
        if (!evidence) return true
        if (evidence.type === 'file' && !hasAnyFiles(ind.id)) return true
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

        // 2. Upload Files & Save Evidence for ALL indicators that have files
        for (const indicator of periodIndicators.value) {
            const evidence = formData.evidences[indicator.id]
            if (!evidence) continue

            // Skip if no files and no URL
            if (evidence.type === 'file' && !hasAnyFiles(indicator.id)) continue
            if (evidence.type === 'url' && !evidence.url) continue

            // Handle URL type
            if (evidence.type === 'url' && evidence.url) {
                const evidencePayload = {
                    evaluatee_id: myEvaluateeInfo.value.id,
                    indicator_id: indicator.id,
                    file_path: null,
                    url: evidence.url,
                    description: evidence.description || ''
                }
                await api.post('/evidence', evidencePayload)
                continue
            }

            // Handle multiple file upload
            const newFiles = evidence.files || []
            for (const file of newFiles) {
                try {
                    // Upload file
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)

                    const uploadRes = await api.post('/upload', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    if (uploadRes.data.status === 1) {
                        // Create evidence record for this file
                        const evidencePayload = {
                            evaluatee_id: myEvaluateeInfo.value.id,
                            indicator_id: indicator.id,
                            file_path: uploadRes.data.data.path,
                            url: null,
                            description: evidence.description || ''
                        }
                        await api.post('/evidence', evidencePayload)
                    }
                } catch (uploadErr) {
                    console.error('Upload error:', uploadErr)
                    toast.error(`อัปโหลดไฟล์ "${file.name}" ล้มเหลว`)
                }
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
            fetchSelfEvaluations(),
            fetchTopics(),
            fetchPositions(),
            fetchDepartments()
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
