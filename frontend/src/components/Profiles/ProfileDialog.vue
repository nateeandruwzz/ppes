<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/services/axios'
import { toast } from 'vue-sonner'
import * as lucide from 'lucide-vue-next'
import Modal from '../Modal.vue'

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:open'])

const authStore = useAuthStore()
const isEditing = ref(false)
const isLoading = ref(false)

// Form data for editing
const formData = reactive({
    first_name: '',
    last_name: '',
    email: ''
})

// ฟังชั่นเปลี่ยน role จาก database ให้เป็นภาษาไทย
const roleName = (role) => {
    switch (role) {
        case 'Personnel':
            return 'บุคลากร'
        case 'Evaluator':
            return 'ผู้ประเมิน'
        case 'Evaluatees':
            return 'ผู้รับการประเมิน'
        default:
            return 'ไม่พบข้อมูล'
    }
}

// Computed title for the modal
const dialogTitle = computed(() => isEditing.value ? 'แก้ไขข้อมูลส่วนตัว' : 'ข้อมูลส่วนตัว')

// Watch for dialog open to reset form
watch(() => props.open, (newVal) => {
    if (newVal) {
        // Reset to view mode and populate form
        isEditing.value = false
        formData.first_name = authStore.user?.first_name || ''
        formData.last_name = authStore.user?.last_name || ''
        formData.email = authStore.user?.email || ''
    }
})

const closeDialog = () => {
    emit('update:open', false)
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
    // Reset form data
    formData.first_name = authStore.user?.first_name || ''
    formData.last_name = authStore.user?.last_name || ''
    formData.email = authStore.user?.email || ''
}

const saveProfile = async () => {
    // Validate
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
        return
    }

    isLoading.value = true
    try {
        const response = await api.put(`/user/${authStore.user.id}`, {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            role: authStore.user.role // Keep the same role
        })

        if (response.data.status === 1) {
            // Update store
            authStore.setUser({
                ...authStore.user,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim()
            })
            toast.success('บันทึกข้อมูลสำเร็จ')
            isEditing.value = false
        } else {
            toast.error('ไม่สามารถบันทึกข้อมูลได้')
        }
    } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        isLoading.value = false
    }
}

const getUserInitials = () => {
    const first = authStore.user?.first_name?.[0] || ''
    const last = authStore.user?.last_name?.[0] || ''
    return (first + last).toUpperCase()
}
</script>

<template>
    <Modal :is-open="open" :title="dialogTitle" size="md" @close="closeDialog">
        <!-- Content -->
        <div class="space-y-6">
            <!-- View Mode -->
            <div v-if="!isEditing" class="space-y-6">
                <!-- Avatar Section -->
                <div class="flex flex-col items-center gap-3">
                    <div
                        class="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600 border-4 border-sky-50">
                        {{ getUserInitials() }}
                    </div>
                    <div class="text-center">
                        <h3 class="text-lg font-semibold text-zinc-900">
                            {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
                        </h3>
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 mt-1">
                            {{ roleName(authStore.user?.role) }}
                        </span>
                    </div>
                </div>

                <!-- Info Cards -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                            <component :is="lucide.User" class="w-5 h-5 text-sky-600" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs text-zinc-500">ชื่อ</p>
                            <p class="font-medium text-zinc-900 truncate">{{ authStore.user?.first_name }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <component :is="lucide.UserCheck" class="w-5 h-5 text-amber-600" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs text-zinc-500">นามสกุล</p>
                            <p class="font-medium text-zinc-900 truncate">{{ authStore.user?.last_name }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <component :is="lucide.Mail" class="w-5 h-5 text-green-600" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs text-zinc-500">อีเมล</p>
                            <p class="font-medium text-zinc-900 truncate">{{ authStore.user?.email }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="space-y-5">
                <!-- Avatar -->
                <div class="flex justify-center">
                    <div
                        class="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600 border-4 border-sky-50">
                        {{ getUserInitials() }}
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="space-y-4">
                    <div class="space-y-1.5">
                        <label for="first_name" class="block text-sm font-medium text-zinc-700">ชื่อ</label>
                        <input id="first_name" v-model="formData.first_name" type="text" placeholder="กรอกชื่อ"
                            class="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none" />
                    </div>
                    <div class="space-y-1.5">
                        <label for="last_name" class="block text-sm font-medium text-zinc-700">นามสกุล</label>
                        <input id="last_name" v-model="formData.last_name" type="text" placeholder="กรอกนามสกุล"
                            class="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none" />
                    </div>
                    <div class="space-y-1.5">
                        <label for="email" class="block text-sm font-medium text-zinc-700">อีเมล</label>
                        <input id="email" v-model="formData.email" type="email" placeholder="กรอกอีเมล"
                            class="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <template v-if="!isEditing">
                    <button @click="closeDialog"
                        class="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-100 transition-colors">
                        ปิด
                    </button>
                    <button @click="startEditing"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors">
                        <component :is="lucide.Pencil" class="w-4 h-4" />
                        แก้ไข
                    </button>
                </template>
                <template v-else>
                    <button @click="cancelEditing" :disabled="isLoading"
                        class="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50">
                        ยกเลิก
                    </button>
                    <button @click="saveProfile" :disabled="isLoading"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-50">
                        <component :is="isLoading ? lucide.Loader2 : lucide.Check"
                            :class="['w-4 h-4', isLoading && 'animate-spin']" />
                        {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
                    </button>
                </template>
            </div>
        </div>
    </Modal>
</template>
