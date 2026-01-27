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

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
    const dropdown = document.getElementById('user-dropdown')
    const trigger = document.getElementById('user-dropdown-trigger')
    if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        closeDropdown()
    }
}

// Add/remove event listener
import { onMounted, onUnmounted } from 'vue'
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
            class="w-full p-2 rounded-full hover:bg-zinc-100 cursor-pointer transition-all duration-300 ease-in-out">
            <div class="flex items-center gap-2">
                <!-- Avatar -->
                <div
                    class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-600 flex-shrink-0 overflow-hidden border border-sky-100">
                    <img v-if="getProfilePictureUrl()" :src="getProfilePictureUrl()" alt="Profile"
                        class="w-full h-full object-cover" />
                    <span v-else>{{ getUserInitials() }}</span>
                </div>
                <div v-if="isOpen" class="flex flex-col w-full text-left min-w-0">
                    <span class="text-sm font-medium text-zinc-800 truncate">{{ user?.first_name }} {{ user?.last_name
                        }}</span>
                    <span class="text-xs text-gray-500 truncate">{{ user?.email }}</span>
                </div>
            </div>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
            <div v-if="isDropdownOpen" id="user-dropdown"
                class="absolute left-full bottom-0 ml-3 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-50">
                <!-- Header -->
                <div class="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                    <p class="text-sm font-semibold text-zinc-800">โปรไฟล์ของฉัน</p>
                </div>

                <!-- Menu Items -->
                <div class="py-1">
                    <button @click="openProfileDialog"
                        class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors text-left">
                        <component :is="lucide.User" class="w-4 h-4 text-zinc-500" />
                        ข้อมูลส่วนตัว
                    </button>
                    <button @click="handleLogout"
                        class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                        <component :is="lucide.LogOut" class="w-4 h-4" />
                        ออกจากระบบ
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
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateX(-8px);
}
</style>