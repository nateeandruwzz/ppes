import Indicator from "../models/indicatorModel.js";

export const getIndicatorAll = async (req, res) => {
    try {
        const rows = await Indicator.getAll();
        if (rows.length > 0) {
            return res.json({ status: 1, message: "สำเร็จ", data: rows });
        } else {
            return res.json({ status: 0, message: "ไม่พบข้อมูล" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getIndicatorID = async (req, res) => {
    try {
        const result = await Indicator.getByID(req.params.id);
        if (!result) {
            res.json({ status: 0, message: "ไม่พบข้อมูล" });
        } else {
            res.json({ status: 1, message: "สำเร็จ", data: result });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getIndicatorPeriod = async (req, res) => {
    try {
        const periodId = req.params.id;

        // ตรวจสอบว่ามี period_id หรือไม่
        if (!periodId || periodId === 'undefined' || periodId === 'null') {
            return res.json({ status: 0, message: "กรุณาระบุรอบการประเมิน" });
        }

        const result = await Indicator.getByPeriod(periodId);
        if (!result || result.length === 0) {
            return res.json({ status: 0, message: "ไม่พบตัวชี้วัดในรอบนี้", data: [] });
        }

        return res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        console.error('Error in getIndicatorPeriod:', err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createIndicator = async (req, res) => {
    try {
        const { name, description, period_id, topic_id, weight, required_evidence } = req.body;
        const result = await Indicator.create(name, description, period_id, topic_id, weight, required_evidence);
        if (result.insertId > 0) {
            return res.status(201).json({ status: 1, message: "สำเร็จ", data: result });
        } else {
            return res.status(400).json({ status: 0, message: "ไม่สำเร็จ" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateIndicator = async (req, res) => {
    try {
        const { name, description, period_id, topic_id, weight, required_evidence } = req.body;
        const result = await Indicator.update(req.params.id, name, description, period_id, topic_id, weight, required_evidence);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

import CommitteeEvaluation from "../models/committeeEvaluationModel.js";
import SelfEvaluation from "../models/selfEvaluationModel.js";
import Evidence from "../models/evidenceModel.js";

export const deleteIndicator = async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Delete related committee evaluations
        await CommitteeEvaluation.deleteByIndicator(id);

        // 2. Delete related self evaluations
        await SelfEvaluation.deleteByIndicator(id);

        // 3. Delete related evidences
        await Evidence.deleteByIndicator(id);

        // 4. Delete the indicator itself
        const result = await Indicator.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "ลบตัวชี้วัดและข้อมูลที่เกี่ยวข้องสำเร็จ", data: result });
    } catch (err) {
        console.error("Delete Indicator Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด", error: err.message });
    }
};