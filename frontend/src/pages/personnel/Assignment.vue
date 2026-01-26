<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const assignments = ref([])
const periods = ref([])
const evaluatees = ref([])
const evaluators = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const modalMode = ref('create')
const deleteId = ref(null)

// ตัวกรอง
const selectedPeriodFilter = ref('')

// Form Data
const form = reactive({
    id: null,
    period_id: '',
    evaluatee_id: '',
    committee_user_id: ''
})

// กรองตามรอบการประเมิน
const filteredAssignments = computed(() => {
    if (!selectedPeriodFilter.value) return assignments.value
    return assignments.value.filter(a => a.period_id == selectedPeriodFilter.value)
})

// ดึงข้อมูลการมอบหมายทั้งหมด
const fetchAssignments = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/committee')
        if (response.data.status === 1) {
            assignments.value = response.data.data
        } else {
            assignments.value = []
        }
    } catch (error) {
        console.error('Error fetching assignments:', error)
        toast.error('ไม่สามารถดึงข้อมูลการมอบหมายได้')
    } finally {
        isLoading.value = false
    }
}

// ดึงข้อมูลรอบการประเมิน
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

// ดึงข้อมูลผู้ถูกประเมิน (จากตาราง evaluatees)
const fetchEvaluatees = async () => {
    try {
        const response = await api.get('/evaluatee')
        if (response.data.status === 1) {
            evaluatees.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching evaluatees:', error)
    }
}

// ดึงข้อมูล users เพื่อแสดงชื่อ
const users = ref([])
const fetchUsers = async () => {
    try {
        const response = await api.get('/user/role/Evaluatees')
        if (response.data.status === 1) {
            users.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

// ดึงข้อมูลกรรมการ (Evaluator)
const fetchEvaluators = async () => {
    try {
        const response = await api.get('/user/role/Evaluator')
        if (response.data.status === 1) {
            evaluators.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching evaluators:', error)
    }
}

// เปิด Modal
const openModal = (mode, item = null) => {
    modalMode.value = mode
    isModalOpen.value = true

    if (mode === 'edit' && item) {
        form.id = item.id
        form.period_id = item.period_id
        form.evaluatee_id = item.evaluatee_id
        form.committee_user_id = item.committee_user_id
    } else {
        form.id = null
        form.period_id = selectedPeriodFilter.value || ''
        form.evaluatee_id = ''
        form.committee_user_id = ''
    }
}

// ปิด Modal
const closeModal = () => {
    isModalOpen.value = false
}

// บันทึกข้อมูล
const handleSubmit = async () => {
    try {
        const payload = {
            period_id: form.period_id,
            evaluatee_id: form.evaluatee_id,
            committee_user_id: form.committee_user_id
        }

        if (modalMode.value === 'create') {
            await api.post('/committee', payload)
            toast.success('เพิ่มการมอบหมายสำเร็จ')
        } else {
            await api.put(`/committee/${form.id}`, payload)
            toast.success('แก้ไขการมอบหมายสำเร็จ')
        }
        closeModal()
        fetchAssignments()
    } catch (error) {
        console.error('Error saving assignment:', error)
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
        await api.delete(`/committee/${deleteId.value}`)
        toast.success('ลบการมอบหมายเรียบร้อยแล้ว')
        closeDeleteModal()
        fetchAssignments()
    } catch (error) {
        console.error('Error deleting assignment:', error)
        toast.error('ไม่สามารถลบข้อมูลได้')
    }
}

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

// ใช้สำหรับ dropdown - หาชื่อ user จาก user_id
const getUserNameById = (userId) => {
    const user = users.value.find(u => u.id === userId)
    return user ? `${user.first_name} ${user.last_name}` : '-'
}

const getEvaluatorName = (id) => {
    const user = evaluators.value.find(u => u.id === id)
    return user ? `${user.first_name} ${user.last_name}` : '-'
}

onMounted(() => {
    fetchAssignments()
    fetchPeriods()
    fetchEvaluatees()
    fetchUsers()
    fetchEvaluators()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">มอบหมายกรรมการ</h2>
                <p class="text-zinc-500 text-sm">กำหนดว่ากรรมการคนไหนจะประเมินผู้ถูกประเมินคนไหน</p>
            </div>
            <button @click="openModal('create')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.Plus" class="w-5 h-5" />
                เพิ่มการมอบหมาย
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
                                รอบการประเมิน</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                ผู้ถูกประเมิน</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                กรรมการผู้ประเมิน</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <tr v-if="isLoading">
                            <td colspan="5" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <tr v-else-if="filteredAssignments.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-else v-for="(item, index) in filteredAssignments" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                    {{ getPeriodName(item.period_id) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-zinc-800">{{ getEvaluateeName(item.evaluatee_id)
                                        }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-zinc-800">{{ getEvaluatorName(item.committee_user_id)
                                        }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button @click="openModal('edit', item)"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-white cursor-pointer hover:bg-amber-500 transition-colors"
                                    title="แก้ไข">
                                    <component :is="lucide.Pencil" class="w-4 h-4" />
                                </button>
                                <button @click="openDeleteModal(item.id)"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
                                    title="ลบ">
                                    <component :is="lucide.Trash2" class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <Modal :isOpen="isModalOpen" :title="modalMode === 'create' ? 'เพิ่มการมอบหมายใหม่' : 'แก้ไขการมอบหมาย'"
            size="lg" @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- รอบการประเมิน -->
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

                <!-- ผู้ถูกประเมิน -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ผู้ถูกประเมิน</label>
                    <select v-model="form.evaluatee_id" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                        <option value="" disabled>เลือกผู้ถูกประเมิน</option>
                        <option v-for="evaluatee in evaluatees" :key="evaluatee.id" :value="evaluatee.id">
                            {{ getUserNameById(evaluatee.user_id) }}
                        </option>
                    </select>
                </div>

                <!-- กรรมการผู้ประเมิน -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">กรรมการผู้ประเมิน</label>
                    <select v-model="form.committee_user_id" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                        <option value="" disabled>เลือกกรรมการ</option>
                        <option v-for="user in evaluators" :key="user.id" :value="user.id">
                            {{ user.first_name }} {{ user.last_name }}
                        </option>
                    </select>
                </div>

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

        <!-- Confirm Modal -->
        <ConfirmModal :isOpen="isDeleteModalOpen" title="ยืนยันการลบ?"
            message="คุณต้องการลบการมอบหมายนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้" confirmText="ลบ"
            cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />
    </div>
</template>
