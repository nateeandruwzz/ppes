import IndicatorReference from "../models/indicatorReferenceModel.js";

export const getReferencesByIndicator = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await IndicatorReference.getByIndicator(id);
        res.json({ status: 1, message: "สำเร็จ", data: rows });
    } catch (err) {
        console.error("Get Refs Error:", err);
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createReference = async (req, res) => {
    try {
        const { indicator_id, ref_type, ref_name, url } = req.body;

        let ref_path = url || null;

        // Handle File upload
        if (ref_type === 'file' && req.file) {
            ref_path = `/uploads/${req.file.filename}`;
        }

        if (!ref_path && ref_type === 'file') {
            return res.status(400).json({ status: 0, message: "กรุณาแนบไฟล์" });
        }

        if (!ref_path && ref_type === 'url') {
            return res.status(400).json({ status: 0, message: "กรุณาระบุ URL" });
        }

        const result = await IndicatorReference.create(indicator_id, ref_type, ref_name, ref_path);

        if (result.insertId > 0) {
            res.status(201).json({
                status: 1,
                message: "สำเร็จ",
                data: { id: result.insertId, ref_path }
            });
        } else {
            res.status(400).json({ status: 0, message: "ไม่สำเร็จ" });
        }
    } catch (err) {
        console.error("Create Ref Error:", err);
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

// สร้าง multiple references จากหลายไฟล์
export const createMultipleReferences = async (req, res) => {
    try {
        const { indicator_id, ref_name } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ status: 0, message: "กรุณาเลือกไฟล์" });
        }

        const createdRefs = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ref_path = `/uploads/${file.filename}`;
            const fileName = files.length > 1 ? `${ref_name} (${i + 1})` : ref_name;

            const result = await IndicatorReference.create(indicator_id, 'file', fileName, ref_path);

            if (result.insertId > 0) {
                createdRefs.push({
                    id: result.insertId,
                    ref_name: fileName,
                    ref_path: ref_path,
                    originalName: file.originalname
                });
            }
        }

        res.status(201).json({
            status: 1,
            message: `เพิ่มเอกสาร ${createdRefs.length} ไฟล์สำเร็จ`,
            data: createdRefs
        });
    } catch (err) {
        console.error("Create Multiple Refs Error:", err);
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const deleteReference = async (req, res) => {
    try {
        const result = await IndicatorReference.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "ลบสำเร็จ" });
    } catch (err) {
        console.error("Delete Ref Error:", err);
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};
