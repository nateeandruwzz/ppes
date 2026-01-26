<script setup>
import * as lucide from 'lucide-vue-next'

// Props
const props = defineProps({
    // เปิด/ปิด Modal
    isOpen: {
        type: Boolean,
        default: false
    },
    // หัวข้อ
    title: {
        type: String,
        default: 'ยืนยันการดำเนินการ?'
    },
    // ข้อความรายละเอียด
    message: {
        type: String,
        default: 'คุณต้องการดำเนินการนี้ใช่หรือไม่'
    },
    // ข้อความปุ่มยืนยัน
    confirmText: {
        type: String,
        default: 'ยืนยัน'
    },
    // ข้อความปุ่มยกเลิก
    cancelText: {
        type: String,
        default: 'ยกเลิก'
    },
    // ประเภท: 'danger', 'warning', 'info'
    type: {
        type: String,
        default: 'danger'
    }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// ยืนยัน
const handleConfirm = () => {
    emit('confirm')
}

// ยกเลิก
const handleCancel = () => {
    emit('cancel')
}

// กำหนดสีตามประเภท
const typeConfig = {
    danger: {
        bgIcon: 'bg-red-100',
        textIcon: 'text-red-600',
        bgButton: 'bg-red-500 hover:bg-red-600',
        icon: lucide.AlertTriangle
    },
    warning: {
        bgIcon: 'bg-amber-100',
        textIcon: 'text-amber-600',
        bgButton: 'bg-amber-500 hover:bg-amber-600',
        icon: lucide.AlertCircle
    },
    info: {
        bgIcon: 'bg-sky-100',
        textIcon: 'text-sky-600',
        bgButton: 'bg-sky-500 hover:bg-sky-600',
        icon: lucide.HelpCircle
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            @click.self="handleCancel">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                <!-- Icon -->
                <div class="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                    :class="typeConfig[type].bgIcon">
                    <component :is="typeConfig[type].icon" class="w-6 h-6" :class="typeConfig[type].textIcon" />
                </div>

                <!-- Title -->
                <h3 class="text-lg font-bold text-zinc-800 mb-2">{{ title }}</h3>

                <!-- Message -->
                <p class="text-zinc-500 text-sm mb-6">{{ message }}</p>

                <!-- Buttons -->
                <div class="flex gap-3">
                    <button @click="handleCancel"
                        class="flex-1 px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium transition-colors">
                        {{ cancelText }}
                    </button>
                    <button @click="handleConfirm"
                        class="flex-1 px-4 py-2 rounded-xl text-white font-medium transition-colors"
                        :class="typeConfig[type].bgButton">
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
