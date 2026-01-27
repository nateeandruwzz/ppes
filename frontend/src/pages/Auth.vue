<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { api } from '../services/axios'
import { loginSchema, registerSchema } from '../schema/authSchema'
import { zodToError } from '../utils/zod'
import { useAuthStore } from '../store/authStore'

const tabs = ref('login')
const positions = ref([])
const departments = ref([])
const loading = ref(false)
const errors = reactive({})
const router = useRouter()
const { setAuth } = useAuthStore()
const prefix = ref([
    'นาย',
    'นาง',
    'นางสาว',
    'Mr',
    'Mrs',
    'Ms'
])

// Clear error
const clearError = () => {
    for (const k in errors) delete errors[k]
}

// Reset form
const resetForm = () => {
    registerForm.prefix = ''
    registerForm.first_name = ''
    registerForm.last_name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirm_password = ''
    registerForm.phone = ''
}

// Form login
const loginForm = reactive({
    email: '',
    password: ''
})

// Form register
const registerForm = reactive({
    prefix: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    position_id: '',
    department_id: ''
})

// Get posotion & department
const fetchMasterData = async () => {
    try {
        loading.value = true

        const [positionRes, departmentRes] = await Promise.all([
            api.get('/position'),
            api.get('/department')
        ])

        positions.value = positionRes.data.data
        departments.value = departmentRes.data.data
    } catch (err) {
        console.log(err)
        toast.error(err.response?.data?.message || 'ดึงข้อมูลไม่สำเร็จ')
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchMasterData();
})


// Handle register
const submitRegister = async () => {
    clearError()

    const parsed = registerSchema.safeParse(registerForm)
    if (!parsed.success) {
        Object.assign(errors, zodToError(parsed.error))
        return
    }
    try {
        loading.value = true

        if (registerForm.password != registerForm.confirm_password) {
            toast.error('รหัสผ่านไม่ตรงกัน')
            return
        }

        await api.post('/user/register', {
            prefix: registerForm.prefix,
            first_name: registerForm.first_name,
            last_name: registerForm.last_name,
            email: registerForm.email,
            password: registerForm.password,
            phone: registerForm.phone,
            role: 'Evaluatees'
        });

        toast.success('ลงทะเบียนสำเร็จ')
        resetForm()
        tabs.value = 'login'
    } catch (err) {
        toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
        loading.value = false
    }
}

// Handle login
const submitLogin = async () => {
    clearError()

    const parsed = loginSchema.safeParse(loginForm)
    if (!parsed.success) {
        Object.assign(errors, zodToError(parsed.error))
        return
    }
    try {
        loading.value = true

        const res = await api.post('/user/login', {
            email: loginForm.email,
            password: loginForm.password
        })

        const newToken = res.data.token;
        const userData = res.data.data;

        // Set data to authStore
        setAuth(newToken, userData);

        // Redirect to dashboard by role
        if (userData.role) {
            switch (userData.role) {
                case "Personnel":
                    router.push('/personnel')
                    break;
                case "Evaluatees":
                    router.push('/evaluatee')
                    break;
                case "Evaluator":
                    router.push('/committee')
                    break;
                default:
                    router.push('/auth')
                    break;
            }
        }

        toast.success('เข้าสู่ระบบสำเร็จ')
    } catch (err) {
        toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
        loading.value = false
    }
}

</script>

<template>
    <div class="flex justify-center items-center h-screen">
        <div class="flex flex-col gap-5 w-full max-w-2xl">
            <!-- Head Text -->
            <h2 class="text-2xl font-bold text-center text-zinc-700 mb-5">ลงชื่อเข้าใช้งาน</h2>

            <!-- Tabs -->
            <div class="flex p-1! items-center bg-slate-50! border border-gray-100! rounded-full">
                <button
                    :class="tabs === 'login' ? 'px-8 py-2.5! rounded-full bg-sky-500 text-white w-full font-semibold! cursor-pointer' : 'px-8 py-2.5! rounded-full w-full font-semibold! cursor-pointer text-zinc-700'"
                    @click="tabs = 'login'">
                    เข้าสู่ระบบ
                </button>

                <button
                    :class="tabs === 'register' ? 'px-8 py-2.5! rounded-full bg-sky-500 text-white w-full font-semibold! cursor-pointer' : 'px-8 py-2.5! rounded-full w-full font-semibold! cursor-pointer text-zinc-700'"
                    @click="tabs = 'register'">
                    สมัครสมาชิก (สำหรับผู้รับการประเมิน)
                </button>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="submitLogin" v-if="tabs === 'login'"
                class="p-4! rounded-3xl bg-slate-50! border border-gray-100!">
                <div>
                    <div class="grid grid-cols-1 gap-5">
                        <div class="col-span-1">
                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">อีเมล</label>
                                <input v-model="loginForm.email" type="email"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                            </div>
                        </div>

                        <div class="col-span-1">
                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">รหัสผ่าน</label>
                                <input v-model="loginForm.password" type="password"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                            </div>
                        </div>

                        <button type="submit"
                            class="px-3 py-2.5 rounded-xl bg-sky-500 text-white font-semibold cursor-pointer hover:bg-sky-500/70 transition-all ease-in-out">เข้าสู่ระบบ</button>
                    </div>
                </div>
            </form>

            <!-- Register Form -->
            <form @submit.prevent="submitRegister" v-if="tabs === 'register'"
                class="p-4! rounded-3xl bg-slate-50! border border-gray-100!">
                <div class="grid grid-cols-4 space-y-5 gap-2">
                    <div class="col-span-1">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="text-sm text-zinc-600">คำนำหน้า</label>
                            <select v-model="registerForm.prefix"
                                class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                                <option value="" disabled hidden>เลือกคำนำหน้า</option>
                                <option v-for="item in prefix" :value="item">{{ item }}</option>
                            </select>
                            <p v-if="errors.prefix" class="text-red-500 text-xs">{{ errors.prefix }}</p>
                        </div>
                    </div>

                    <div class="col-span-3">
                        <div class="flex gap-2">
                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">ชื่อ</label>
                                <input v-model="registerForm.first_name" type="text"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                                <p v-if="errors.first_name" class="text-red-500 text-xs">{{ errors.first_name }}</p>
                            </div>

                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">นามสกุล</label>
                                <input v-model="registerForm.last_name" type="text"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                                <p v-if="errors.last_name" class="text-red-500 text-xs">{{ errors.last_name }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-2">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm text-zinc-500">อีเมล</label>
                            <input v-model="registerForm.email" type="email"
                                class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                            <p v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</p>
                        </div>
                    </div>

                    <div class="col-span-2">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm text-zinc-500">หมายเลขโทรศัพท์</label>
                            <input v-model="registerForm.phone" type="text"
                                class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                            <p v-if="errors.phone" class="text-red-500 text-xs">{{ errors.phone }}</p>
                        </div>
                    </div>

                    <div class="col-span-4">
                        <div class="flex flex-1 gap-2">
                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">รหัสผ่าน</label>
                                <input v-model="registerForm.password" type="password"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                                <p v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</p>
                            </div>

                            <div class="flex flex-col gap-2 w-full">
                                <label class="text-sm text-zinc-500">ยืนยันรหัสผ่าน</label>
                                <input v-model="registerForm.confirm_password" type="password"
                                    class="px-3 py-2.5 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none">
                                <p v-if="errors.confirm_password" class="text-red-500 text-xs">{{
                                    errors.confirm_password }}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        class="col-span-4 px-3 py-2.5 rounded-xl bg-sky-500 text-white font-semibold cursor-pointer hover:bg-sky-500/70 transition-all ease-in-out">
                        {{ loading ? 'กำลังโหลดข้อมูล...' : 'ลงทะเบียน' }}
                    </button>
                </div>
            </form>

            <!-- Copyright -->
            <p class="text-center items-center text-sm text-zinc-400 tracking-tight font-light">&copy; {{ new
                Date().getFullYear() }} thunderdevz All rights reserved.</p>
        </div>
    </div>
</template>