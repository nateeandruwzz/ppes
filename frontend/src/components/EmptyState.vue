<script setup>
import { ref } from 'vue'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
import { Inbox } from 'lucide-vue-next';
</script>

<template>
    <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Inbox />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีข้อมูลให้แสดง</EmptyTitle>
            <EmptyDescription>
                ขณะนี้ยังไม่มีข้อมูลในระบบ หรือไม่พบข้อมูลจากเงื่อนไขที่ค้นหา
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>

        </EmptyContent>
    </Empty>
</template>