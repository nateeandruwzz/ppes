<script setup>
import { Loader2 } from 'lucide-vue-next'

defineProps({
    text: {
        type: String,
        default: 'กำลังโหลดข้อมูล...'
    },
    overlay: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <!-- Overlay Mode (Full Screen) -->
    <div v-if="overlay" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
            <Loader2 class="w-10 h-10 text-sky-500 animate-spin" />
            <p class="text-zinc-500 font-medium animate-pulse">{{ text }}</p>
        </div>
    </div>

    <!-- Inline Mode -->
    <div v-else class="flex flex-col items-center justify-center py-12">
        <Loader2 class="w-8 h-8 text-sky-500 animate-spin" />
        <p v-if="text" class="mt-3 text-sm text-zinc-400 animate-pulse">{{ text }}</p>
    </div>
</template>
