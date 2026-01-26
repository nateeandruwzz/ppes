<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'

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

// === ส่วนเกณฑ์คะแนน ===

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

// เปิด Modal ยืนยันการลบ
const openDeleteModal = (id, type = 'indicator') => {
    deleteId.value = id
    deleteType.value = type
    isDeleteModalOpen.value = true
}

// ปิด Modal ยืนยันการลบ
const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
    deleteId.value = null
}

// ลบข้อมูล
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
                <table class="w-full text-left">
                    <thead class="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">#
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                ชื่อตัวชี้วัด</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                คำอธิบาย</th>
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
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <tr v-if="isLoading">
                            <td colspan="7" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <tr v-else-if="indicators.length === 0">
                            <td colspan="7" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-else v-for="(item, index) in indicators" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-zinc-800">{{ item.name }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">
                                <div class="text-sm text-zinc-600 truncate max-w-xs">{{ item.description }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                    {{ getTopicName(item.topic_id) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">{{ getPeriodName(item.period_id) }}</td>
                            <td class="px-6 py-4 text-sm text-zinc-600 text-center">
                                <span class="text-emerald-700 font-semibold">{{ item.weight }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="scale in getScalesByPeriod(item.period_id)" :key="scale.id"
                                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                                        {{ scale.name }}={{ scale.value }}
                                    </span>
                                    <span v-if="getScalesByPeriod(item.period_id).length === 0"
                                        class="text-xs text-zinc-400">
                                        ยังไม่มีเกณฑ์
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
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
                <!-- ชื่อตัวชี้วัด -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อตัวชี้วัด</label>
                    <input v-model="form.name" type="text" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกชื่อตัวชี้วัด" />
                </div>

                <!-- คำอธิบาย -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">คำอธิบาย</label>
                    <textarea v-model="form.description" rows="2"
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"></textarea>
                </div>

                <!-- หัวข้อ และ รอบการประเมิน -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">หัวข้อการประเมิน</label>
                        <select v-model="form.topic_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกหัวข้อ</option>
                            <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                                {{ topic.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">รอบการประเมิน</label>
                        <select v-model="form.period_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกรอบการประเมิน</option>
                            <option v-for="period in periods" :key="period.id" :value="period.id">
                                {{ period.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- น้ำหนักคะแนน -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">น้ำหนักคะแนน</label>
                    <input v-model="form.weight" type="number" min="0" max="100" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกน้ำหนักคะแนน (0-100)" />
                </div>

                <!-- ต้องการหลักฐาน -->
                <div>
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                        <input v-model="form.required_evidence" type="checkbox"
                            class="w-5 h-5 text-sky-500 border-zinc-300 rounded focus:ring-sky-500 cursor-pointer" />
                        <span class="text-sm font-medium text-zinc-700">ต้องการหลักฐานประกอบการประเมิน</span>
                    </label>
                </div>

                <!-- เกณฑ์การให้คะแนน (Scale) -->
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

                <!-- Buttons -->
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
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อเกณฑ์</label>
                        <input v-model="scaleForm.name" type="text" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                            placeholder="เช่น ดีมาก" />
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-zinc-700 mb-1">คะแนน</label>
                        <input v-model="scaleForm.value" type="number" min="0" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                            placeholder="5" />
                    </div>
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
    </div>
</template>
