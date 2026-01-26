<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const periods = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const deleteId = ref(null)

// Form Data
const form = reactive({
    id: null,
    name: '',
    start_date: '',
    end_date: '',
    status: ''
})

// สถานะที่สามารถเลือกได้
const statusOptions = [
    { value: 'Start', label: 'เปิดใช้งาน', color: 'bg-green-50 text-green-700' },
    { value: 'Finish', label: 'ปิดใช้งาน', color: 'bg-zinc-100 text-zinc-600' },
    { value: 'Pending', label: 'รอดำเนินการ', color: 'bg-amber-50 text-amber-700' },
]

// ดึงข้อมูลรอบการประเมินทั้งหมด
const fetchPeriods = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/period')
        if (response.data.status === 1) {
            periods.value = response.data.data
        } else {
            periods.value = []
        }
    } catch (error) {
        console.error('Error fetching periods:', error)
        toast.error('ไม่สามารถดึงข้อมูลรอบการประเมินได้')
    } finally {
        isLoading.value = false
    }
}

// เปิด Modal สำหรับเพิ่ม/แก้ไข
const openModal = (mode, period = null) => {
    modalMode.value = mode
    isModalOpen.value = true

    if (mode === 'edit' && period) {
        form.id = period.id
        form.name = period.name
        form.start_date = period.start_date ? dayjs(period.start_date).format('YYYY-MM-DD') : ''
        form.end_date = period.end_date ? dayjs(period.end_date).format('YYYY-MM-DD') : ''
        form.status = period.status
    } else {
        // รีเซ็ตฟอร์มสำหรับการเพิ่มใหม่
        form.id = null
        form.name = ''
        form.start_date = ''
        form.end_date = ''
        form.status = 'Start'
    }
}

// ปิด Modal
const closeModal = () => {
    isModalOpen.value = false
}

// บันทึกข้อมูล (เพิ่ม/แก้ไข)
const handleSubmit = async () => {
    try {
        const payload = {
            name: form.name,
            start_date: form.start_date,
            end_date: form.end_date,
            status: form.status
        }

        if (modalMode.value === 'create') {
            await api.post('/period', payload)
            toast.success('เพิ่มข้อมูลสำเร็จ')
        } else {
            await api.put(`/period/${form.id}`, payload)
            toast.success('แก้ไขข้อมูลสำเร็จ')
        }
        closeModal()
        fetchPeriods()
    } catch (error) {
        console.error('Error saving period:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
    }
}

// เปิด Modal ยืนยันการลบ
const openDeleteModal = (id) => {
    deleteId.value = id
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
        await api.delete(`/period/${deleteId.value}`)
        toast.success('ลบข้อมูลเรียบร้อยแล้ว')
        closeDeleteModal()
        fetchPeriods()
    } catch (error) {
        console.error('Error deleting period:', error)
        toast.error('ไม่สามารถลบข้อมูลได้')
    }
}

// Format วันที่
const formatDate = (date) => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY')
}

// หา status label และ color
const getStatusInfo = (period) => {
    if (!period) return { label: '-', color: 'bg-zinc-100 text-zinc-600' }

    // Check Expiration
    if (period.status === 'Start' || period.status === 'active') {
        const today = dayjs()
        const endDate = dayjs(period.end_date)
        if (today.isAfter(endDate, 'day')) {
            return { label: 'สิ้นสุดระยะเวลา', color: 'bg-red-50 text-red-700' }
        }
    }

    const status = period.status
    if (!status) return { label: '-', color: 'bg-zinc-100 text-zinc-600' }

    // แปลงเป็นตัวเล็กเพื่อเปรียบเทียบ (เผื่อ Database ส่งมาเป็น Active/Inactive)
    const normalized = String(status).toLowerCase().trim()

    const found = statusOptions.find(s => s.value.toLowerCase() === normalized)

    return found || { label: status, color: 'bg-zinc-100 text-zinc-600' }
}

onMounted(() => {
    fetchPeriods()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">จัดการรอบการประเมิน</h2>
                <p class="text-zinc-500 text-sm">กำหนดรอบการประเมินและช่วงเวลาที่ใช้ในระบบ</p>
            </div>
            <button @click="openModal('create')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.Plus" class="w-5 h-5" />
                เพิ่มรอบการประเมิน
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
                                ชื่อรอบการประเมิน</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                วันเริ่มต้น</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                วันสิ้นสุด</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                                สถานะ</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <!-- Loading State -->
                        <tr v-if="isLoading">
                            <td colspan="6" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <!-- Empty State -->
                        <tr v-else-if="periods.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <!-- Data Rows -->
                        <tr v-else v-for="(item, index) in periods" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4 text-base font-medium text-zinc-800">{{ item.name }}</td>
                            <td class="px-6 py-4 text-sm text-zinc-600">
                                <div class="flex items-center gap-2">
                                    <component :is="lucide.CalendarDays" class="w-4 h-4 text-zinc-400" />
                                    {{ formatDate(item.start_date) }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">
                                <div class="flex items-center gap-2">
                                    <component :is="lucide.CalendarDays" class="w-4 h-4 text-zinc-400" />
                                    {{ formatDate(item.end_date) }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                    :class="getStatusInfo(item).color">
                                    {{ getStatusInfo(item).label }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button @click="openModal('edit', item)"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-white hover:bg-amber-500 transition-colors cursor-pointer"
                                    title="แก้ไข">
                                    <component :is="lucide.Pencil" class="w-4 h-4" />
                                </button>
                                <button @click="openDeleteModal(item.id)"
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

        <!-- Modal สำหรับเพิ่ม/แก้ไข -->
        <Modal :isOpen="isModalOpen" :title="modalMode === 'create' ? 'เพิ่มรอบการประเมินใหม่' : 'แก้ไขรอบการประเมิน'"
            size="lg" @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- ชื่อรอบการประเมิน -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อรอบการประเมิน</label>
                    <input v-model="form.name" type="text" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="เช่น รอบที่ 1/2567" />
                </div>

                <!-- วันเริ่มต้น และ วันสิ้นสุด -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">วันเริ่มต้น</label>
                        <input v-model="form.start_date" type="date" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">วันสิ้นสุด</label>
                        <input v-model="form.end_date" type="date" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                    </div>
                </div>

                <!-- สถานะ -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">สถานะ</label>
                    <select v-model="form.status" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 pt-2">
                    <button type="button" @click="closeModal"
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
            message="คุณต้องการลบรอบการประเมินนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้" confirmText="ลบ"
            cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />
    </div>
</template>
