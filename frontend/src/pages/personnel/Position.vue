<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const positions = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const modalMode = ref('create')
const deleteId = ref(null)

// Form Data
const form = reactive({
    id: null,
    name: ''
})

// ดึงข้อมูลตำแหน่งทั้งหมด
const fetchPositions = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/position')
        if (response.data.status === 1) {
            positions.value = response.data.data
        } else {
            positions.value = []
        }
    } catch (error) {
        console.error('Error fetching positions:', error)
        toast.error('ไม่สามารถดึงข้อมูลตำแหน่งได้')
    } finally {
        isLoading.value = false
    }
}

// เปิด Modal
const openModal = (mode, item = null) => {
    modalMode.value = mode
    isModalOpen.value = true

    if (mode === 'edit' && item) {
        form.id = item.id
        form.name = item.name
    } else {
        form.id = null
        form.name = ''
    }
}

// ปิด Modal
const closeModal = () => {
    isModalOpen.value = false
}

// บันทึกข้อมูล
const handleSubmit = async () => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/position', { name: form.name })
            toast.success('เพิ่มข้อมูลสำเร็จ')
        } else {
            await api.put(`/position/${form.id}`, { name: form.name })
            toast.success('แก้ไขข้อมูลสำเร็จ')
        }
        closeModal()
        fetchPositions()
    } catch (error) {
        console.error('Error saving position:', error)
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
        await api.delete(`/position/${deleteId.value}`)
        toast.success('ลบข้อมูลเรียบร้อยแล้ว')
        closeDeleteModal()
        fetchPositions()
    } catch (error) {
        console.error('Error deleting position:', error)
        toast.error('ไม่สามารถลบข้อมูลได้')
    }
}

onMounted(() => {
    fetchPositions()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">จัดการตำแหน่ง</h2>
                <p class="text-zinc-500 text-sm">จัดการข้อมูลตำแหน่งงานในองค์กร</p>
            </div>
            <button @click="openModal('create')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.Plus" class="w-5 h-5" />
                เพิ่มตำแหน่ง
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
                                ชื่อตำแหน่ง</th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <tr v-if="isLoading">
                            <td colspan="3" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <tr v-else-if="positions.length === 0">
                            <td colspan="3" class="px-6 py-8 text-center text-zinc-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-else v-for="(item, index) in positions" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                        <component :is="lucide.Briefcase" class="w-5 h-5 text-teal-600" />
                                    </div>
                                    <span class="font-medium text-zinc-800">{{ item.name }}</span>
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
        <Modal :isOpen="isModalOpen" :title="modalMode === 'create' ? 'เพิ่มตำแหน่งใหม่' : 'แก้ไขตำแหน่ง'" size="md"
            @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อตำแหน่ง</label>
                    <input v-model="form.name" type="text" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกชื่อตำแหน่ง" />
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
            message="คุณต้องการลบตำแหน่งนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้" confirmText="ลบ"
            cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />
    </div>
</template>
