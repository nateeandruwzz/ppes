<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const evaluatees = ref([])
const users = ref([])
const positions = ref([])
const departments = ref([])
const periods = ref([])
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
    user_id: '',
    position_id: '',
    department_id: '',
    period_id: ''
})

// กรองตามรอบการประเมิน
const filteredEvaluatees = computed(() => {
    if (!selectedPeriodFilter.value) return evaluatees.value
    return evaluatees.value.filter(e => e.period_id == selectedPeriodFilter.value)
})

// ดึงข้อมูลผู้ถูกประเมินทั้งหมด
const fetchEvaluatees = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/evaluatee')
        if (response.data.status === 1) {
            evaluatees.value = response.data.data
        } else {
            evaluatees.value = []
        }
    } catch (error) {
        console.error('Error fetching evaluatees:', error)
        toast.error('ไม่สามารถดึงข้อมูลผู้ถูกประเมินได้')
    } finally {
        isLoading.value = false
    }
}

// ดึงข้อมูล users (role = Evaluatees)
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

// ดึงข้อมูลตำแหน่ง
const fetchPositions = async () => {
    try {
        const response = await api.get('/position')
        if (response.data.status === 1) {
            positions.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching positions:', error)
    }
}

// ดึงข้อมูลแผนก
const fetchDepartments = async () => {
    try {
        const response = await api.get('/department')
        if (response.data.status === 1) {
            departments.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching departments:', error)
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

// เปิด Modal
const openModal = (mode, item = null) => {
    modalMode.value = mode
    isModalOpen.value = true

    if (mode === 'edit' && item) {
        form.id = item.id
        form.user_id = item.user_id
        form.position_id = item.position_id
        form.department_id = item.department_id
        form.period_id = item.period_id
    } else {
        form.id = null
        form.user_id = ''
        form.position_id = ''
        form.department_id = ''
        form.period_id = selectedPeriodFilter.value || ''
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
            user_id: form.user_id,
            position_id: form.position_id,
            department_id: form.department_id,
            period_id: form.period_id
        }

        if (modalMode.value === 'create') {
            await api.post('/evaluatee', payload)
            toast.success('เพิ่มผู้ถูกประเมินสำเร็จ')
        } else {
            await api.put(`/evaluatee/${form.id}`, payload)
            toast.success('แก้ไขข้อมูลสำเร็จ')
        }
        closeModal()
        fetchEvaluatees()
    } catch (error) {
        console.error('Error saving evaluatee:', error)
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
        await api.delete(`/evaluatee/${deleteId.value}`)
        toast.success('ลบข้อมูลเรียบร้อยแล้ว')
        closeDeleteModal()
        fetchEvaluatees()
    } catch (error) {
        console.error('Error deleting evaluatee:', error)
        toast.error('ไม่สามารถลบข้อมูลได้')
    }
}

// Helper functions
const getUserName = (id) => {
    const user = users.value.find(u => u.id === id)
    return user ? `${user.first_name} ${user.last_name}` : '-'
}

const getPositionName = (id) => {
    const position = positions.value.find(p => p.id === id)
    return position ? position.name : '-'
}

const getDepartmentName = (id) => {
    const department = departments.value.find(d => d.id === id)
    return department ? department.name : '-'
}

const getPeriodName = (id) => {
    const period = periods.value.find(p => p.id === id)
    return period ? period.name : '-'
}

onMounted(() => {
    fetchEvaluatees()
    fetchUsers()
    fetchPositions()
    fetchDepartments()
    fetchPeriods()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">จัดการผู้ถูกประเมิน</h2>
                <p class="text-zinc-500 text-sm">เพิ่มผู้ใช้เข้าสู่รายชื่อผู้ถูกประเมินในแต่ละรอบ</p>
            </div>
            <button @click="openModal('create')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.Plus" class="w-5 h-5" />
                เพิ่มผู้ถูกประเมิน
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
                                ชื่อ-นามสกุล</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ตำแหน่ง
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">แผนก</th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                รอบการประเมิน</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <tr v-if="isLoading">
                            <td colspan="6" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <tr v-else-if="filteredEvaluatees.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-else v-for="(item, index) in filteredEvaluatees" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <span class="font-medium text-zinc-800">{{ getUserName(item.user_id) }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-zinc-600">
                                <p>{{ getPositionName(item.position_id) || '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-zinc-600">
                                <p>{{ getDepartmentName(item.department_id) || '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-zinc-600">
                                <span
                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                    {{ getPeriodName(item.period_id) }}
                                </span>
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
        <Modal :isOpen="isModalOpen"
            :title="modalMode === 'create' ? 'เพิ่มผู้ถูกประเมินใหม่' : 'แก้ไขข้อมูลผู้ถูกประเมิน'" size="lg"
            @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- เลือกผู้ใช้ -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">เลือกผู้ใช้</label>
                    <select v-model="form.user_id" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                        <option value="" disabled>เลือกผู้ใช้</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                        </option>
                    </select>
                </div>

                <!-- ตำแหน่ง และ แผนก -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">ตำแหน่ง</label>
                        <select v-model="form.position_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกตำแหน่ง</option>
                            <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                                {{ pos.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">แผนก</label>
                        <select v-model="form.department_id" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                            <option value="" disabled>เลือกแผนก</option>
                            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                {{ dept.name }}
                            </option>
                        </select>
                    </div>
                </div>

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
            message="คุณต้องการลบผู้ถูกประเมินนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้" confirmText="ลบ"
            cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />
    </div>
</template>
