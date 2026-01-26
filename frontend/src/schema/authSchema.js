import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email({ message: 'กรุณากรอกอีเมล' }),
    password: z.string().min(1, { message: 'กรุณากรอกรหัสผ่าน' })
})

export const registerSchema = z.object({
    prefix: z.string().min(1, { message: 'กรุณากรอกคำนำหน้า' }),
    first_name: z.string().min(1, { message: 'กรุณากรอกชื่อ' }),
    last_name: z.string().min(1, { message: 'กรุณากรอกนามสกุล' }),
    email: z.string().email({ message: 'กรุณากรอกอีเมล' }),
    password: z.string().min(3, { message: 'รหัสผ่านจะต้องมีความยาวอย่างน้อย 3 ตัว' }),
    phone: z.string().min(1, { message: 'กรุณากรอกหมายเลขโทรศัพท์' }),
    confirm_password: z.string().min(1, { message: 'กรุณายืนยันรหัสผ่าน' }),
}).refine((data) => data.password === data.confirm_password, { message: 'รหัสผ่านไม่ตรงกัน', path: ['confirm_password'] })