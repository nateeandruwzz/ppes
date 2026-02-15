<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/services/axios'
import { toast } from 'vue-sonner'
import * as lucide from 'lucide-vue-next'
import Modal from '../Modal.vue'
import { BASE_URL } from '@/config'

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:open'])

const authStore = useAuthStore()
const activeTab = ref('info') // 'info' | 'password'
const isEditing = ref(false)
const isLoading = ref(false)
const fileInput = ref(null)
const profilePreview = ref(null)
const selectedFile = ref(null)

// Prefix options
const prefixOptions = ['นาย', 'นาง', 'นางสาว']

// Form data for editing profile
const formData = reactive({
    prefix: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
})

// Form data for changing password
const passwordForm = reactive({
    newPassword: '',
    confirmPassword: ''
})

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Role translation
const roleName = (role) => {
    switch (role) {
        case 'Personnel': return 'บุคลากร (แอดมิน)'
        case 'Evaluator': return 'ผู้ประเมิน (กรรมการ)'
        case 'Evaluatees': return 'ผู้รับการประเมิน'
        default: return 'ไม่พบข้อมูล'
    }
}

// Computed title
const dialogTitle = computed(() => {
    if (activeTab.value === 'password') return 'เปลี่ยนรหัสผ่าน'
    return isEditing.value ? 'แก้ไขข้อมูลส่วนตัว' : 'ข้อมูลส่วนตัว'
})

// Profile picture URL
const getProfilePictureUrl = () => {
    if (profilePreview.value) return profilePreview.value
    if (authStore.user?.profile_img) {
        return `${BASE_URL}${authStore.user.profile_img}`
    }
    return null
}

// Watch for dialog open
watch(() => props.open, (newVal) => {
    if (newVal) {
        activeTab.value = 'info'
        isEditing.value = false
        populateForm()
        resetPasswordForm()
        profilePreview.value = null
        selectedFile.value = null
    }
})

const populateForm = () => {
    formData.prefix = authStore.user?.prefix || ''
    formData.first_name = authStore.user?.first_name || ''
    formData.last_name = authStore.user?.last_name || ''
    formData.email = authStore.user?.email || ''
    formData.phone = authStore.user?.phone || ''
}

const resetPasswordForm = () => {
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showNewPassword.value = false
    showConfirmPassword.value = false
}

const closeDialog = () => {
    emit('update:open', false)
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
    populateForm()
    profilePreview.value = null
    selectedFile.value = null
}

const triggerFileInput = () => {
    fileInput.value.click()
}

const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
        return
    }
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        profilePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
}

// Save profile
const saveProfile = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
        return
    }
    isLoading.value = true
    try {
        let profilePicturePath = authStore.user.profile_img

        if (selectedFile.value) {
            try {
                const uploadFormData = new FormData()
                uploadFormData.append('file', selectedFile.value)
                const uploadRes = await api.post('/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                if (uploadRes.data.status === 1) {
                    profilePicturePath = uploadRes.data.data.path
                    await api.put(`/user/profile-picture/${authStore.user.id}`, {
                        profile_img: profilePicturePath
                    })
                }
            } catch (err) {
                console.error('Upload Error:', err)
                toast.error('อัปโหลดรูปโปรไฟล์ไม่สำเร็จ')
            }
        }

        const response = await api.put(`/user/${authStore.user.id}`, {
            prefix: formData.prefix.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim()
        })

        if (response.data.status === 1) {
            authStore.setUser({
                ...authStore.user,
                prefix: formData.prefix.trim(),
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                profile_img: profilePicturePath
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

// Save password
const savePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('กรุณากรอกรหัสผ่านให้ครบ')
        return
    }
    if (passwordForm.newPassword.length < 6) {
        toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('รหัสผ่านไม่ตรงกัน')
        return
    }

    isLoading.value = true
    try {
        const response = await api.put(`/user/password/${authStore.user.id}`, {
            password: passwordForm.newPassword
        })
        if (response.data.status === 1) {
            toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
            resetPasswordForm()
        } else {
            toast.error('ไม่สามารถเปลี่ยนรหัสผ่านได้')
        }
    } catch (error) {
        console.error('Error changing password:', error)
        toast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    } finally {
        isLoading.value = false
    }
}

const getUserInitials = () => {
    const first = authStore.user?.first_name?.[0] || ''
    const last = authStore.user?.last_name?.[0] || ''
    return (first + last).toUpperCase()
}

const passwordsMatch = computed(() => {
    return passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
})

const passwordsMismatch = computed(() => {
    return passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
})
</script>

<template>
    <Modal :is-open="open" :title="dialogTitle" size="md" @close="closeDialog">
        <div class="space-y-5">

            <!-- Tabs -->
            <div class="flex bg-zinc-100 rounded-lg p-1 gap-1">
                <button @click="activeTab = 'info'; isEditing = false; populateForm()"
                    :class="activeTab === 'info' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
                    class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">
                    <component :is="lucide.User" class="w-4 h-4" />
                    ข้อมูลส่วนตัว
                </button>
                <button @click="activeTab = 'password'; isEditing = false; resetPasswordForm()"
                    :class="activeTab === 'password' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
                    class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200">
                    <component :is="lucide.KeyRound" class="w-4 h-4" />
                    เปลี่ยนรหัสผ่าน
                </button>
            </div>

            <!-- ==================== TAB: INFO ==================== -->
            <template v-if="activeTab === 'info'">

                <!-- View Mode -->
                <div v-if="!isEditing" class="space-y-5">
                    <!-- Profile Card -->
                    <div
                        class="bg-gradient-to-br from-sky-50 via-sky-50/50 to-white rounded-2xl p-5 border border-sky-100/60">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden ring-3 ring-white shadow-md"
                                :class="getProfilePictureUrl() ? '' : 'bg-gradient-to-br from-sky-400 to-sky-600 text-white'">
                                <img v-if="getProfilePictureUrl()" :src="getProfilePictureUrl()" alt="Profile"
                                    class="w-full h-full object-cover" />
                                <span v-else>{{ getUserInitials() }}</span>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-base font-semibold text-zinc-900 truncate">
                                    {{ authStore.user?.prefix }} {{ authStore.user?.first_name }} {{
                                    authStore.user?.last_name }}
                                </h3>
                                <p class="text-sm text-zinc-500 truncate mt-0.5">{{ authStore.user?.email }}</p>
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-100 text-sky-700 mt-1.5">
                                    {{ roleName(authStore.user?.role) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Info List -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                            <div class="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                <component :is="lucide.User" class="w-4.5 h-4.5 text-sky-600" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">ชื่อ - นามสกุล
                                </p>
                                <p class="text-sm font-medium text-zinc-800 truncate">{{ authStore.user?.prefix }} {{
                                    authStore.user?.first_name }} {{ authStore.user?.last_name }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                <component :is="lucide.Mail" class="w-4.5 h-4.5 text-green-600" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">อีเมล</p>
                                <p class="text-sm font-medium text-zinc-800 truncate">{{ authStore.user?.email }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                <component :is="lucide.Phone" class="w-4.5 h-4.5 text-amber-600" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">เบอร์โทร</p>
                                <p class="text-sm font-medium text-zinc-800 truncate">{{ authStore.user?.phone || '-' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- View Footer -->
                    <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                        <button @click="closeDialog"
                            class="px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 font-medium hover:bg-zinc-50 transition-colors">
                            ปิด
                        </button>
                        <button @click="startEditing"
                            class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 text-sm text-white font-medium hover:bg-sky-600 transition-colors">
                            <component :is="lucide.Pencil" class="w-3.5 h-3.5" />
                            แก้ไข
                        </button>
                    </div>
                </div>

                <!-- Edit Mode -->
                <div v-else class="space-y-5">
                    <!-- Avatar Upload -->
                    <div class="flex flex-col items-center gap-2">
                        <div class="relative group cursor-pointer" @click="triggerFileInput">
                            <div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden ring-3 ring-white shadow-md group-hover:ring-sky-200 transition-all"
                                :class="getProfilePictureUrl() ? '' : 'bg-gradient-to-br from-sky-400 to-sky-600 text-white'">
                                <img v-if="getProfilePictureUrl()" :src="getProfilePictureUrl()" alt="Profile"
                                    class="w-full h-full object-cover" />
                                <span v-else>{{ getUserInitials() }}</span>
                            </div>
                            <div
                                class="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                <component :is="lucide.Camera" class="w-6 h-6 text-white" />
                            </div>
                            <div
                                class="absolute -bottom-0.5 -right-0.5 p-1.5 bg-sky-500 rounded-full text-white border-2 border-white shadow-sm">
                                <component :is="lucide.Camera" class="w-3 h-3" />
                            </div>
                        </div>
                        <p class="text-xs text-zinc-400">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
                        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                    </div>

                    <!-- Form Fields -->
                    <div class="space-y-3.5">
                        <div class="space-y-1.5">
                            <label class="block text-xs font-medium text-zinc-500">คำนำหน้า</label>
                            <select v-model="formData.prefix"
                                class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none">
                                <option value="" disabled>เลือกคำนำหน้า</option>
                                <option v-for="p in prefixOptions" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label class="block text-xs font-medium text-zinc-500">ชื่อ</label>
                                <input v-model="formData.first_name" type="text" placeholder="กรอกชื่อ"
                                    class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-xs font-medium text-zinc-500">นามสกุล</label>
                                <input v-model="formData.last_name" type="text" placeholder="กรอกนามสกุล"
                                    class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none" />
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-xs font-medium text-zinc-500">อีเมล</label>
                            <input v-model="formData.email" type="email" placeholder="กรอกอีเมล"
                                class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none" />
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-xs font-medium text-zinc-500">เบอร์โทร</label>
                            <input v-model="formData.phone" type="tel" placeholder="กรอกเบอร์โทร"
                                class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none" />
                        </div>
                    </div>

                    <!-- Edit Footer -->
                    <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                        <button @click="cancelEditing" :disabled="isLoading"
                            class="px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50">
                            ยกเลิก
                        </button>
                        <button @click="saveProfile" :disabled="isLoading"
                            class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 text-sm text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-50">
                            <component :is="isLoading ? lucide.Loader2 : lucide.Check"
                                :class="['w-3.5 h-3.5', isLoading && 'animate-spin']" />
                            {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
                        </button>
                    </div>
                </div>
            </template>

            <!-- ==================== TAB: PASSWORD ==================== -->
            <template v-if="activeTab === 'password'">
                <div class="space-y-5">
                    <!-- Header Illustration -->
                    <div class="flex flex-col items-center gap-3 py-3">
                        <div
                            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-sm border border-amber-100/60">
                            <component :is="lucide.ShieldCheck" class="w-7 h-7 text-amber-600" />
                        </div>
                        <p class="text-sm text-zinc-500 text-center">กรอกรหัสผ่านใหม่เพื่อเปลี่ยนรหัสผ่านของคุณ</p>
                    </div>

                    <!-- Password Fields -->
                    <div class="space-y-3.5">
                        <div class="space-y-1.5">
                            <label class="block text-xs font-medium text-zinc-500">รหัสผ่านใหม่</label>
                            <div class="relative">
                                <input v-model="passwordForm.newPassword" :type="showNewPassword ? 'text' : 'password'"
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    class="w-full h-10 px-3 pr-10 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all outline-none" />
                                <button type="button" @click="showNewPassword = !showNewPassword"
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-0.5">
                                    <component :is="showNewPassword ? lucide.EyeOff : lucide.Eye" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-xs font-medium text-zinc-500">ยืนยันรหัสผ่านใหม่</label>
                            <div class="relative">
                                <input v-model="passwordForm.confirmPassword"
                                    :type="showConfirmPassword ? 'text' : 'password'" placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    :class="passwordsMismatch ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' : 'border-zinc-200 focus:border-sky-500 focus:ring-sky-500/10'"
                                    class="w-full h-10 px-3 pr-10 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:ring-2 transition-all outline-none" />
                                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-0.5">
                                    <component :is="showConfirmPassword ? lucide.EyeOff : lucide.Eye" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <!-- Status indicator -->
                        <Transition name="fade">
                            <div v-if="passwordsMatch || passwordsMismatch"
                                :class="passwordsMatch ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'"
                                class="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium">
                                <component :is="passwordsMatch ? lucide.CheckCircle2 : lucide.XCircle"
                                    class="w-3.5 h-3.5" />
                                {{ passwordsMatch ? 'รหัสผ่านตรงกัน' : 'รหัสผ่านไม่ตรงกัน' }}
                            </div>
                        </Transition>
                    </div>

                    <!-- Password Footer -->
                    <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                        <button @click="closeDialog"
                            class="px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 font-medium hover:bg-zinc-50 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="savePassword" :disabled="isLoading || !passwordsMatch"
                            class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 text-sm text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <component :is="isLoading ? lucide.Loader2 : lucide.KeyRound"
                                :class="['w-3.5 h-3.5', isLoading && 'animate-spin']" />
                            {{ isLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน' }}
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </Modal>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
