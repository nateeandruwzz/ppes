<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from '../../services/axios'
import * as lucide from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Components
import Modal from '../../components/Modal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

// State
const committees = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const deleteId = ref(null)

// คำนำหน้าชื่อ
const prefixOptions = ['นาย', 'นาง', 'นางสาว']

// Form Data
const form = reactive({
    prefix: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: ''
})

// รีเซ็ตฟอร์ม
const resetForm = () => {
    form.prefix = ''
    form.first_name = ''
    form.last_name = ''
    form.email = ''
    form.password = ''
    form.phone = ''
}

// ดึงข้อมูลกรรมการ
const fetchCommittees = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/user/role/Evaluator')
        if (response.data.status === 1) {
            committees.value = response.data.data
        } else {
            committees.value = []
        }
    } catch (error) {
        console.error('Error fetching committees:', error)
        toast.error('ไม่สามารถดึงข้อมูลกรรมการได้')
    } finally {
        isLoading.value = false
    }
}

// เปิด Modal
const openModal = () => {
    resetForm()
    isModalOpen.value = true
}

// ปิด Modal
const closeModal = () => {
    isModalOpen.value = false
}

// เพิ่มกรรมการ
const handleSubmit = async () => {
    try {
        await api.post('/user/register', {
            prefix: form.prefix,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: 'Evaluator'
        })
        toast.success('เพิ่มกรรมการสำเร็จ')
        closeModal()
        fetchCommittees()
    } catch (error) {
        console.error('Error adding committee:', error)
        if (error.response?.data?.message) {
            toast.error(error.response.data.message)
        } else {
            toast.error('เกิดข้อผิดพลาดในการเพิ่มกรรมการ')
        }
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

// ลบกรรมการ
const handleDelete = async () => {
    try {
        await api.delete(`/user/${deleteId.value}`)
        toast.success('ลบกรรมการเรียบร้อยแล้ว')
        closeDeleteModal()
        fetchCommittees()
    } catch (error) {
        console.error('Error deleting committee:', error)
        toast.error('ไม่สามารถลบกรรมการได้')
    }
}

onMounted(() => {
    fetchCommittees()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-zinc-800">จัดการคณะกรรมการ</h2>
                <p class="text-zinc-500 text-sm">แสดงรายชื่อผู้ใช้ที่เป็นกรรมการประเมิน (Evaluator)</p>
            </div>
            <button @click="openModal"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                <component :is="lucide.UserPlus" class="w-5 h-5" />
                เพิ่มกรรมการ
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
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">อีเมล
                            </th>
                            <th class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">เบอร์โทร
                            </th>
                            <th
                                class="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        <!-- Loading State -->
                        <tr v-if="isLoading">
                            <td colspan="5" class="px-6 py-8 text-center text-zinc-400">กำลังโหลดข้อมูล...</td>
                        </tr>
                        <!-- Empty State -->
                        <tr v-else-if="committees.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-zinc-400">ยังไม่มีกรรมการ</td>
                        </tr>
                        <!-- Data Rows -->
                        <tr v-else v-for="(item, index) in committees" :key="item.id"
                            class="hover:bg-zinc-50/50 transition-colors">
                            <td class="px-6 py-4 text-sm text-zinc-500">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div>
                                        <div class="font-medium text-zinc-800">{{ item.prefix }} {{ item.first_name }}
                                            {{ item.last_name }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-600">{{ item.email }}</td>
                            <td class="px-6 py-4 text-sm text-zinc-600">{{ item.phone || '-' }}</td>
                            <td class="px-6 py-4 text-right">
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

        <!-- Modal สำหรับเพิ่มกรรมการ -->
        <Modal :isOpen="isModalOpen" title="เพิ่มกรรมการใหม่" size="lg" @close="closeModal">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- คำนำหน้า -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">คำนำหน้า</label>
                    <select v-model="form.prefix" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                        <option value="" disabled>เลือกคำนำหน้า</option>
                        <option v-for="prefix in prefixOptions" :key="prefix" :value="prefix">
                            {{ prefix }}
                        </option>
                    </select>
                </div>

                <!-- ชื่อ-นามสกุล -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">ชื่อ</label>
                        <input v-model="form.first_name" type="text" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                            placeholder="กรอกชื่อ" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">นามสกุล</label>
                        <input v-model="form.last_name" type="text" required
                            class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                            placeholder="กรอกนามสกุล" />
                    </div>
                </div>

                <!-- อีเมล -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">อีเมล</label>
                    <input v-model="form.email" type="email" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="example@email.com" />
                </div>

                <!-- รหัสผ่าน -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">รหัสผ่าน</label>
                    <input v-model="form.password" type="password" required
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="กรอกรหัสผ่าน" />
                </div>

                <!-- เบอร์โทร -->
                <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1">เบอร์โทรศัพท์</label>
                    <input v-model="form.phone" type="tel"
                        class="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-zinc-300"
                        placeholder="0812345678" />
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 pt-2">
                    <button type="button" @click="closeModal"
                        class="flex-1 px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 rounded-xl text-white bg-sky-500 hover:bg-sky-600 font-medium shadow-md shadow-sky-500/20 transition-all">
                        เพิ่มกรรมการ
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Modal ยืนยันการลบ -->
        <ConfirmModal :isOpen="isDeleteModalOpen" title="ยืนยันการลบ?"
            message="คุณต้องการลบกรรมการนี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้" confirmText="ลบ"
            cancelText="ยกเลิก" type="danger" @confirm="handleDelete" @cancel="closeDeleteModal" />
    </div>
</template>
