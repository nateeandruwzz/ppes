<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import ProfileDialog from './ProfileDialog.vue'
import * as lucide from 'lucide-vue-next'
import { BASE_URL } from '@/config'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

// Dropdown state
const isDropdownOpen = ref(false)

// Profile dialog state
const isProfileDialogOpen = ref(false)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
    isDropdownOpen.value = false
}

const openProfileDialog = () => {
    isProfileDialogOpen.value = true
    closeDropdown()
}

const handleLogout = () => {
    try {
        authStore.logout()
        toast.success('ออกจากระบบสำเร็จ')
        router.push('/auth')
    } catch (err) {
        toast.error('ออกจากระบบไม่สำเร็จ')
    }
}

const getUserInitials = () => {
    const first = user.value?.first_name?.[0] || ''
    const last = user.value?.last_name?.[0] || ''
    return (first + last).toUpperCase()
}

const getProfilePictureUrl = () => {
    if (user.value?.profile_img) {
        return `${BASE_URL}${user.value.profile_img}`
    }
    return null
}

const roleName = (role) => {
    switch (role) {
        case 'Personnel': return 'บุคลากร (แอดมิน)'
        case 'Evaluator': return 'ผู้ประเมิน'
        case 'Evaluatees': return 'ผู้รับการประเมิน'
        default: return 'ผู้ใช้งาน'
    }
}

// Close dropdown when clicking outside
import { onMounted, onUnmounted } from 'vue'
const handleClickOutside = (e) => {
    const dropdown = document.getElementById('user-dropdown')
    const trigger = document.getElementById('user-dropdown-trigger')
    if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        closeDropdown()
    }
}
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="relative">
        <!-- Trigger Button -->
        <button id="user-dropdown-trigger" @click="toggleDropdown"
            class="w-full rounded-xl hover:bg-zinc-100 cursor-pointer transition-all duration-200 ease-in-out"
            :class="isOpen ? 'p-2.5' : 'p-2'">
            <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm"
                    :class="getProfilePictureUrl() ? '' : 'bg-gradient-to-br from-sky-400 to-sky-600 text-white'">
                    <img v-if="getProfilePictureUrl()" :src="getProfilePictureUrl()" alt="Profile"
                        class="w-full h-full object-cover" />
                    <span v-else class="text-xs">{{ getUserInitials() }}</span>
                </div>
                <div v-if="isOpen" class="flex-1 min-w-0 text-left">
                    <p class="text-sm font-semibold text-zinc-800 truncate leading-tight">{{ user?.first_name }} {{
                        user?.last_name }}</p>
                    <p class="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">{{ roleName(user?.role) }}</p>
                </div>
                <component v-if="isOpen" :is="lucide.ChevronsUpDown" class="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
            <div v-if="isDropdownOpen" id="user-dropdown"
                class="absolute left-full bottom-0 ml-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200/80 overflow-hidden z-50">
                <!-- User Header -->
                <div class="px-4 py-3.5 bg-gradient-to-br from-zinc-50 to-zinc-100/80 border-b border-zinc-100">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm"
                            :class="getProfilePictureUrl() ? '' : 'bg-gradient-to-br from-sky-400 to-sky-600 text-white'">
                            <img v-if="getProfilePictureUrl()" :src="getProfilePictureUrl()" alt="Profile"
                                class="w-full h-full object-cover" />
                            <span v-else>{{ getUserInitials() }}</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-sm font-semibold text-zinc-800 truncate">{{ user?.first_name }} {{
                                user?.last_name }}</p>
                            <p class="text-xs text-zinc-500 truncate">{{ user?.email }}</p>
                        </div>
                    </div>
                </div>

                <!-- Menu Items -->
                <div class="p-1.5">
                    <button @click="openProfileDialog"
                        class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors text-left group">
                        <div
                            class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                            <component :is="lucide.UserPen" class="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                            <p class="font-medium text-zinc-700">ข้อมูลส่วนตัว</p>
                            <p class="text-[11px] text-zinc-400">แก้ไขโปรไฟล์และรหัสผ่าน</p>
                        </div>
                    </button>
                    <div class="mx-2 my-1 border-t border-zinc-100"></div>
                    <button @click="handleLogout"
                        class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left group">
                        <div
                            class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <component :is="lucide.LogOut" class="w-4 h-4 text-red-500" />
                        </div>
                        <p class="font-medium">ออกจากระบบ</p>
                    </button>
                </div>
            </div>
        </Transition>
    </div>

    <!-- Profile Dialog -->
    <ProfileDialog v-model:open="isProfileDialogOpen" />
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateX(-6px) scale(0.98);
}
</style>