<script setup>
import * as lucide from 'lucide-vue-next'

// Props
const props = defineProps({
    // เปิด/ปิด Modal
    isOpen: {
        type: Boolean,
        default: false
    },
    // หัวข้อ Modal
    title: {
        type: String,
        default: ''
    },
    // ขนาด Modal: 'sm', 'md', 'lg', 'xl'
    size: {
        type: String,
        default: 'md'
    }
})

// Emits
const emit = defineEmits(['close'])

// ปิด Modal
const closeModal = () => {
    emit('close')
}

// กำหนดขนาด Modal
const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen"
            class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 pb-8 bg-black/50 backdrop-blur-sm overflow-y-auto"
            @click.self="closeModal">
            <div class="bg-white rounded-2xl shadow-xl w-full px-6 pb-5 pt-2 my-auto max-h-[90vh] overflow-y-auto"
                :class="sizeClasses[size]">
                <!-- Header -->
                <div
                    class="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 -mt-2 pt-2 -mx-6 px-6">
                    <h3 class="text-xl font-bold text-zinc-800">{{ title }}</h3>
                    <button @click="closeModal" class="text-zinc-400 hover:text-zinc-600 transition-colors p-2.5 cursor-pointer rounded-full hover:bg-zinc-100">
                        <component :is="lucide.X" class="w-5 h-5" />
                    </button>
                </div>

                <!-- Content (ใช้ slot) -->
                <slot></slot>
            </div>
        </div>
    </Teleport>
</template>
