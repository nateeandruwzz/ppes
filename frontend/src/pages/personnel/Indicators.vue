<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { BASE_URL } from '../../config'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const indicators = ref([])
const topics = ref([])
const periods = ref([])
const scales = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isScaleModalOpen = ref(false)
const indicatorMode = ref('create')
const scaleMode = ref('create')
const deleteId = ref(null)
const deleteType = ref('indicator')

// Reference State
const isRefModalOpen = ref(false)
const currentIndicator = ref(null)
const references = ref([])
const isUploadingRef = ref(false)
const refForm = reactive({
    type: 'file',
    name: '',
    url: '',
    files: []
})

// Form Data สำหรับตัวชี้วัด
const form = reactive({
    id: null,
    name: '',
    description: '',
    period_id: '',
    topic_id: '',
    weight: '',
    required_evidence: false
})

// Form Data สำหรับเกณฑ์คะแนน
const scaleForm = reactive({
    id: null,
    period_id: '',
    name: '',
    value: ''
})

// ดึงข้อมูลตัวชี้วัดทั้งหมด
const fetchIndicators = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/indicator')
        if (response.data.status === 1) {
            indicators.value = response.data.data
        } else {
            indicators.value = []
        }
    } catch (error) {
        console.error('Error fetching indicators:', error)
        toast.error('ไม่สามารถดึงข้อมูลตัวชี้วัดได้')
    } finally {
        isLoading.value = false
    }
}

// ดึงข้อมูลหัวข้อสำหรับ dropdown
const fetchTopics = async () => {
    try {
        const response = await api.get('/topic')
        if (response.data.status === 1) {
            topics.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching topics:', error)
    }
}

// ดึงข้อมูลรอบการประเมินสำหรับ dropdown
const fetchPeriods = async () => {
    try {
        const response = await api.get('/period')
        if (response.data.status === 1) {
            periods.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching periods:', error)
    }
}

// ดึงข้อมูลเกณฑ์คะแนนทั้งหมด
const fetchScales = async () => {
    try {
        const response = await api.get('/scale')
        if (response.data.status === 1) {
            scales.value = response.data.data
        } else {
            scales.value = []
        }
    } catch (error) {
        console.error('Error fetching scales:', error)
    }
}

// เกณฑ์คะแนนตามรอบที่เลือกใน form
const periodScales = computed(() => {
    if (!form.period_id) return []
    return scales.value.filter(s => s.period_id == form.period_id)
})

// เปิด Modal สำหรับเพิ่ม/แก้ไขตัวชี้วัด
const openModal = (mode, indicator = null) => {
    indicatorMode.value = mode
    isModalOpen.value = true

    if (mode === 'edit' && indicator) {
        form.id = indicator.id
        form.name = indicator.name
        form.description = indicator.description
        form.period_id = indicator.period_id
        form.topic_id = indicator.topic_id
        form.weight = indicator.weight
        form.required_evidence = Boolean(indicator.required_evidence)
    } else {
        form.id = null
        form.name = ''
        form.description = ''
        form.period_id = ''
        form.topic_id = ''
        form.weight = ''
        form.required_evidence = false
    }
}

// ปิด Modal
const closeModal = () => {
    isModalOpen.value = false
}

// บันทึกข้อมูลตัวชี้วัด
const handleSubmit = async () => {
    try {
        const payload = {
            name: form.name,
            description: form.description,
            period_id: form.period_id,
            topic_id: form.topic_id,
            weight: form.weight,
            required_evidence: form.required_evidence
        }

        if (indicatorMode.value === 'create') {
            await api.post('/indicator', payload)
            toast.success('เพิ่มข้อมูลสำเร็จ')
        } else {
            await api.put(`/indicator/${form.id}`, payload)
            toast.success('แก้ไขข้อมูลสำเร็จ')
        }
        closeModal()
        fetchIndicators()
    } catch (error) {
        console.error('Error saving indicator:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
    }
}

// เปิด Modal สำหรับเพิ่ม/แก้ไขเกณฑ์คะแนน
const openScaleModal = (mode, scale = null) => {
    scaleMode.value = mode
    isScaleModalOpen.value = true

    if (mode === 'edit' && scale) {
        scaleForm.id = scale.id
        scaleForm.period_id = scale.period_id
        scaleForm.name = scale.name
        scaleForm.value = scale.value
    } else {
        scaleForm.id = null
        scaleForm.period_id = form.period_id
        scaleForm.name = ''
        scaleForm.value = ''
    }
}

// ปิด Modal เกณฑ์คะแนน
const closeScaleModal = () => {
    isScaleModalOpen.value = false
}

// บันทึกเกณฑ์คะแนน
const handleScaleSubmit = async () => {
    try {
        const payload = {
            pariod_id: scaleForm.period_id,
            name: scaleForm.name,
            value: Number(scaleForm.value)
        }

        if (scaleMode.value === 'create') {
            await api.post('/scale', payload)
            toast.success('เพิ่มเกณฑ์คะแนนสำเร็จ')
        } else {
            await api.put(`/scale/${scaleForm.id}`, payload)
            toast.success('แก้ไขเกณฑ์คะแนนสำเร็จ')
        }
        closeScaleModal()
        fetchScales()
    } catch (error) {
        console.error('Error saving scale:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึกเกณฑ์คะแนน')
    }
}

// === ส่วนลบข้อมูล ===
const openDeleteModal = (id, type = 'indicator') => {
    deleteId.value = id
    deleteType.value = type
    isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
    deleteId.value = null
}

const handleDelete = async () => {
    try {
        if (deleteType.value === 'indicator') {
            await api.delete(`/indicator/${deleteId.value}`)
            toast.success('ลบตัวชี้วัดเรียบร้อยแล้ว')
            fetchIndicators()
        } else {
            await api.delete(`/scale/${deleteId.value}`)
            toast.success('ลบเกณฑ์คะแนนเรียบร้อยแล้ว')
            fetchScales()
        }
        closeDeleteModal()
    } catch (error) {
        console.error('Error deleting:', error)
        toast.error('ไม่สามารถลบข้อมูลได้')
    }
}

// หาชื่อหัวข้อจาก ID
const getTopicName = (topicId) => {
    const topic = topics.value.find(t => t.id === topicId)
    return topic ? topic.name : '-'
}

// หาชื่อรอบการประเมินจาก ID
const getPeriodName = (periodId) => {
    const period = periods.value.find(p => p.id === periodId)
    return period ? period.name : '-'
}

// หาเกณฑ์คะแนนตามรอบ
const getScalesByPeriod = (periodId) => {
    return scales.value.filter(s => s.period_id == periodId)
}

// ========== Reference Logic ==========

const fetchReferences = async (indicatorId) => {
    try {
        const response = await api.get(`/indicator-reference/indicator/${indicatorId}`)
        if (response.data.status === 1) {
            references.value = response.data.data
        } else {
            references.value = []
        }
    } catch (error) {
        console.error('Error fetching refs:', error)
        references.value = []
    }
}

const openRefModal = (indicator) => {
    currentIndicator.value = indicator
    refForm.type = 'file'
    refForm.name = ''
    refForm.url = ''
    refForm.files = []
    fetchReferences(indicator.id)
    isRefModalOpen.value = true
}

const closeRefModal = () => {
    isRefModalOpen.value = false
    currentIndicator.value = null
    refForm.files = []
}

// Handle file selection
const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length > 0) {
        refForm.files = [...refForm.files, ...selectedFiles]
    }
    event.target.value = ''
}

// Remove file from queue
const removeFileFromQueue = (index) => {
    refForm.files.splice(index, 1)
}

// Format file size
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// Submit reference
const handleRefSubmit = async () => {
    if (!refForm.name) {
        return toast.error('กรุณาระบุชื่อเอกสาร')
    }

    if (refForm.type === 'file' && refForm.files.length === 0) {
        return toast.error('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์')
    }

    if (refForm.type === 'url' && !refForm.url) {
        return toast.error('กรุณาระบุ URL')
    }

    isUploadingRef.value = true

    try {
        if (refForm.type === 'file') {
            const formData = new FormData()
            formData.append('indicator_id', currentIndicator.value.id)
            formData.append('ref_name', refForm.name)

            for (let i = 0; i < refForm.files.length; i++) {
                formData.append('files', refForm.files[i])
            }

            const response = await api.post('/indicator-reference/multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.status === 1) {
                toast.success(response.data.message)
            } else {
                throw new Error(response.data.message)
            }
        } else {
            const payload = {
                indicator_id: currentIndicator.value.id,
                ref_type: 'url',
                ref_name: refForm.name,
                url: refForm.url
            }
            const response = await api.post('/indicator-reference', payload)
            if (response.data.status !== 1) throw new Error('Failed')
            toast.success('เพิ่มลิงก์สำเร็จ')
        }

        fetchReferences(currentIndicator.value.id)
        refForm.name = ''
        refForm.url = ''
        refForm.files = []
    } catch (error) {
        console.error('Error adding ref:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
        isUploadingRef.value = false
    }
}

const handleDeleteRef = async (id) => {
    if (!confirm('ต้องการลบเอกสารนี้ใช่หรือไม่?')) return
    try {
        await api.delete(`/indicator-reference/${id}`)
        toast.success('ลบเอกสารเรียบร้อย')
        fetchReferences(currentIndicator.value.id)
    } catch (error) {
        console.error('Error deleting ref:', error)
        toast.error('ลบเอกสารไม่สำเร็จ')
    }
}

onMounted(() => {
    fetchIndicators()
    fetchTopics()
    fetchPeriods()
    fetchScales()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">จัดการตัวชี้วัด</h2>
                <p class="text-zinc-500 text-sm">จัดการตัวชี้วัดและเกณฑ์การให้คะแนนสำหรับการประเมินบุคลากร</p>
            </div>
            <button @click="openModal('create')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.Plus" class="w-5 h-5" />
                เพิ่มตัวชี้วัด
            </button>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full min-w-max text-left">
                    <thead class="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">#
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                ชื่อตัวชี้วัด</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">คำอธิบาย
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">หัวข้อ
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                รอบการประเมิน</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center w-24">
                                น้ำหนัก</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                เกณฑ์คะแนน</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                เอกสารแนบ</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <tr v-if="isLoading">
                            <td colspan="9" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <tr v-else-if="indicators.length === 0">
                            <td colspan="9" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-else v-for="(item, index) in indicators" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="text-zinc-800">{{ item.name }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">
                                <div class="text-sm text-zinc-800 truncate max-w-xs">{{ item.description || '-' }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-800">
                                <span>
                                    {{ getTopicName(item.topic_id) || '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-800">{{ getPeriodName(item.period_id) }}</td>
                            <td class="px-6 py-4 text-sm text-zinc-800 text-center">
                                <span class="text-emerald-700 font-semibold">{{ item.weight }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col gap-1">
                                    <span v-for="scale in getScalesByPeriod(item.period_id)" :key="scale.id"
                                        class="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-zinc-100 w-fit">
                                        {{ scale.name }}={{ scale.value }}
                                    </span>
                                    <span v-if="getScalesByPeriod(item.period_id).length === 0"
                                        class="text-xs text-zinc-400">
                                        ยังไม่มีเกณฑ์
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button @click="openRefModal(item)"
                                    class="inline-flex items-center justify-center gap-1.5 p-2 rounded-full bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                                    title="จัดการเอกสารแนบ">
                                    <component :is="lucide.Paperclip" class="w-3.5 h-3.5" />
                                </button>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openModal('edit', item)"
                                        class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-white hover:bg-amber-500 transition-colors cursor-pointer"
                                        title="แก้ไข">
                                        <component :is="lucide.Pencil" class="w-4 h-4" />
                                    </button>
                                    <button @click="openDeleteModal(item.id, 'indicator')"
                                        class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                                        title="ลบ">
                                        <component :is="lucide.Trash2" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal สำหรับเพิ่ม/แก้ไขตัวชี้วัด -->
        <Modal :isOpen="isModalOpen" :title="indicatorMode === 'create' ? 'เพิ่มตัวชี้วัดใหม่' : 'แก้ไขตัวชี้วัด'"
            size="xl" @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">หัวข้อการประเมิน</label>
                        <select v-model="form.topic_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกหัวข้อ</option>
                            <option v-for="topic in topics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">รอบการประเมิน</label>
                        <select v-model="form.period_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกรอบการประเมิน</option>
                            <option v-for="period in periods" :key="period.id" :value="period.id">{{ period.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อตัวชี้วัด</label>
                    <input v-model="form.name" type="text" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกชื่อตัวชี้วัด" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">คำอธิบาย</label>
                    <textarea v-model="form.description" rows="2"
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">น้ำหนักคะแนน</label>
                    <input v-model="form.weight" type="number" min="0" max="100" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกน้ำหนักคะแนน (0-100)" />
                </div>

                <div>
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                        <input v-model="form.required_evidence" type="checkbox"
                            class="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500 cursor-pointer" />
                        <span class="text-sm font-medium text-zinc-700">ต้องการหลักฐานประกอบการประเมิน</span>
                    </label>
                </div>

                <!-- เกณฑ์การให้คะแนน -->
                <div v-if="form.period_id" class="border border-zinc-200 rounded-xl p-4 bg-zinc-50">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                            <component :is="lucide.Star" class="w-4 h-4 text-amber-500" />
                            เกณฑ์การให้คะแนน (รอบ: {{ getPeriodName(form.period_id) }})
                        </h4>
                        <button type="button" @click="openScaleModal('create')"
                            class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-sky-600 bg-white hover:bg-sky-50 rounded-full border border-sky-200 transition-colors">
                            <component :is="lucide.Plus" class="w-3 h-3" />
                            เพิ่มเกณฑ์
                        </button>
                    </div>

                    <div v-if="periodScales.length === 0" class="text-center py-4 text-zinc-400 text-sm">
                        ยังไม่มีเกณฑ์คะแนนสำหรับรอบนี้
                    </div>

                    <div v-else class="space-y-2">
                        <div v-for="scale in periodScales" :key="scale.id"
                            class="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-100">
                            <div class="flex items-center gap-3">
                                <span
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-bold text-sm">
                                    {{ scale.value }}
                                </span>
                                <span class="font-medium text-zinc-700">{{ scale.name }}</span>
                            </div>
                            <div class="flex gap-1">
                                <button type="button" @click="openScaleModal('edit', scale)"
                                    class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                    <component :is="lucide.Pencil" class="w-3.5 h-3.5" />
                                </button>
                                <button type="button" @click="openDeleteModal(scale.id, 'scale')"
                                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <component :is="lucide.Trash2" class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else
                    class="text-center py-4 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-xl">
                    เลือกรอบการประเมินก่อนเพื่อดู/จัดการเกณฑ์คะแนน
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" @click="closeModal"
                        class="flex-1 px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 rounded-xl text-white bg-sky-500 hover:bg-sky-600 font-medium shadow-md shadow-sky-500/20 transition-all">
                        บันทึกตัวชี้วัด
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Modal สำหรับเพิ่ม/แก้ไขเกณฑ์คะแนน -->
        <Modal :isOpen="isScaleModalOpen" :title="scaleMode === 'create' ? 'เพิ่มเกณฑ์คะแนน' : 'แก้ไขเกณฑ์คะแนน'"
            size="sm" @close="closeScaleModal">
            <form @submit.prevent="handleScaleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อเกณฑ์</label>
                    <input v-model="scaleForm.name" type="text" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="เช่น ดีมาก" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">คะแนน</label>
                    <input v-model="scaleForm.value" type="number" min="0" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="5" />
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" @click="closeScaleModal"
                        class="flex-1 px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 rounded-xl text-white bg-sky-500 hover:bg-sky-600 font-medium shadow-md shadow-sky-500/20 transition-all">
                        บันทึก
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Modal ยืนยันการลบ -->
        <ConfirmModal :isOpen="isDeleteModalOpen" title="ยืนยันการลบ?"
            :message="deleteType === 'indicator' ? 'คุณต้องการลบตัวชี้วัดนี้ใช่หรือไม่' : 'คุณต้องการลบเกณฑ์คะแนนนี้ใช่หรือไม่'"
            confirmText="ลบ" cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />

        <!-- Modal จัดการเอกสารแนบ -->
        <Modal :isOpen="isRefModalOpen" title="จัดการเอกสารประกอบการประเมิน" size="lg" @close="closeRefModal">
            <div class="space-y-5">
                <!-- Header Info -->
                <div class="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <h4 class="font-semibold text-sky-900">{{ currentIndicator?.name }}</h4>
                    <p class="text-sm text-sky-700 mt-1">{{ currentIndicator?.description || 'ไม่มีคำอธิบาย' }}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            น้ำหนัก: {{ currentIndicator?.weight }} คะแนน
                        </span>
                        <span v-if="currentIndicator?.required_evidence"
                            class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <component :is="lucide.AlertCircle" class="w-3 h-3" />
                            ต้องแนบหลักฐาน
                        </span>
                    </div>
                </div>

                <!-- Upload Form -->
                <div class="border border-zinc-200 rounded-xl p-4">
                    <h5 class="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                        <component :is="lucide.Upload" class="w-4 h-4 text-sky-500" />
                        เพิ่มเอกสารใหม่
                    </h5>

                    <form @submit.prevent="handleRefSubmit" class="space-y-3">
                        <!-- Type Toggle -->
                        <div class="flex gap-2">
                            <button type="button" @click="refForm.type = 'file'"
                                :class="refForm.type === 'file' ? 'bg-sky-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                                class="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm">
                                <component :is="lucide.FileUp" class="w-4 h-4" />
                                อัปโหลดไฟล์
                            </button>
                            <button type="button" @click="refForm.type = 'url'"
                                :class="refForm.type === 'url' ? 'bg-sky-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                                class="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm">
                                <component :is="lucide.Link" class="w-4 h-4" />
                                ลิงก์ URL
                            </button>
                        </div>

                        <!-- Document Name -->
                        <div>
                            <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อเอกสาร <span
                                    class="text-red-500">*</span></label>
                            <input v-model="refForm.name" type="text" required
                                class="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                                :placeholder="refForm.type === 'file' ? 'ชื่อเอกสาร (จะต่อท้ายด้วยหมายเลขถ้ามีหลายไฟล์)' : 'ชื่อลิงก์'" />
                        </div>

                        <!-- File Upload Area -->
                        <div v-if="refForm.type === 'file'" class="space-y-2">
                            <label
                                class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                <component :is="lucide.Upload" class="w-5 h-5 text-zinc-400 mb-1" />
                                <span class="text-sm text-zinc-500">คลิกเพื่อเลือกไฟล์ (เลือกได้หลายไฟล์)</span>
                                <span class="text-xs text-zinc-400 mt-1">รูปภาพ, PDF, Word, Excel</span>
                                <input type="file" multiple @change="handleFileSelect"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" class="hidden" />
                            </label>

                            <!-- Selected Files -->
                            <div v-if="refForm.files.length > 0" class="space-y-1">
                                <p class="text-xs font-medium text-zinc-500">ไฟล์ที่เลือก ({{ refForm.files.length }}
                                    ไฟล์)</p>
                                <div class="max-h-32 overflow-y-auto space-y-1">
                                    <div v-for="(file, index) in refForm.files" :key="index"
                                        class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                                        <component :is="lucide.FileText" class="w-4 h-4 text-green-600 shrink-0" />
                                        <span class="flex-1 truncate text-green-800">{{ file.name }}</span>
                                        <span class="text-xs text-green-600">{{ formatFileSize(file.size) }}</span>
                                        <button type="button" @click="removeFileFromQueue(index)"
                                            class="p-1 hover:bg-green-100 rounded text-green-600 hover:text-red-500">
                                            <component :is="lucide.X" class="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- URL Input -->
                        <div v-else>
                            <label class="block text-sm font-medium text-zinc-700 mb-1">URL</label>
                            <input v-model="refForm.url" type="url"
                                class="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                                placeholder="https://example.com/document.pdf" />
                            <p class="text-xs text-zinc-400 mt-1">ลิงก์ไปยังไฟล์เอกสาร (Google Drive, OneDrive, เว็บไซต์
                                ฯลฯ)</p>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" :disabled="isUploadingRef"
                            class="w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-600 disabled:bg-zinc-300 disabled:cursor-not-allowed">
                            <component :is="isUploadingRef ? lucide.Loader2 : lucide.Plus"
                                :class="['w-4 h-4', isUploadingRef && 'animate-spin']" />
                            {{ isUploadingRef ? 'กำลังอัปโหลด...' : 'เพิ่มเอกสาร' }}
                        </button>
                    </form>
                </div>

                <!-- Existing References List -->
                <div>
                    <h5 class="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                        <component :is="lucide.Files" class="w-4 h-4 text-sky-500" />
                        รายการเอกสารแนบ
                        <span v-if="references.length > 0"
                            class="ml-auto text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            {{ references.length }} รายการ
                        </span>
                    </h5>

                    <!-- Empty State -->
                    <div v-if="references.length === 0"
                        class="text-center py-8 border border-dashed border-zinc-200 rounded-xl">
                        <component :is="lucide.FileX" class="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                        <p class="text-zinc-400 text-sm">ยังไม่มีเอกสารแนบ</p>
                    </div>

                    <!-- References List -->
                    <div v-else class="space-y-2 max-h-48 overflow-y-auto">
                        <div v-for="ref in references" :key="ref.id"
                            class="flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors">
                            <div :class="[
                                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                ref.ref_type === 'url' ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'
                            ]">
                                <component :is="ref.ref_type === 'url' ? lucide.Link : lucide.FileText"
                                    class="w-5 h-5" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-zinc-800 text-sm truncate">{{ ref.ref_name }}</p>
                                <p class="text-xs text-zinc-500 truncate">{{ ref.ref_type === 'url' ? ref.ref_path :
                                    'เอกสารแนบ' }}</p>
                            </div>
                            <div class="flex items-center gap-1">
                                <a :href="ref.ref_type === 'url' ? ref.ref_path : `${BASE_URL}${ref.ref_path}`"
                                    target="_blank"
                                    class="p-2 rounded-lg text-zinc-500 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                                    <component :is="lucide.ExternalLink" class="w-4 h-4" />
                                </a>
                                <button @click="handleDeleteRef(ref.id)"
                                    class="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <component :is="lucide.Trash2" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
