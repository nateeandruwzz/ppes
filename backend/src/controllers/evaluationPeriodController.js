import EvaluationPeriod from "../models/evaluationPeriodModel.js";

export const getEvaluationPeriodAll = async (req, res) => {
    try {
        const rows = await EvaluationPeriod.getAll();
        if (rows.length > 0) {
            return res.json({ status: 1, message: "สำเร็จ", data: rows });
        } else {
            return res.json({ status: 0, message: "ไม่มีข้อมูล" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getEvaluationPeriodID = async (req, res) => {
    try {
        const result = await EvaluationPeriod.getByID(req.params.id);
        if (!result) {
            res.json({ status: 0, message: "ไม่พบข้อมูล" });
        } else {
            res.json({ status: 1, message: "สำเร็จ", data: result });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

// Get periods assigned to a specific user (via evaluatees table)
export const getEvaluationPeriodByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const rows = await EvaluationPeriod.getByUserId(userId);
        if (rows.length > 0) {
            return res.json({ status: 1, message: "สำเร็จ", data: rows });
        } else {
            return res.json({ status: 0, message: "ไม่พบรอบการประเมินที่ได้รับมอบหมาย", data: [] });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createEvaluationPeriod = async (req, res) => {
    try {
        const { name, start_date, end_date, status } = req.body;
        if (!name && !start_date && !end_date && !status) return res.status(400).json({ status: 0, message: "ข้อมูลไม่ครบ" });
        const result = await EvaluationPeriod.create(name, start_date, end_date, status);
        if (result.insertId > 0) {
            return res.status(201).json({ status: 1, message: "สำเร็จ", data: result });
        } else {
            return res.status(400).json({ status: 0, message: "ไม่สำเร็จ" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด", error: err });
    }
};

export const updateEvaluationPeriod = async (req, res) => {
    try {
        const { name, start_date, end_date, status } = req.body;
        if (!name && !start_date && !end_date && !status) return res.status(400).json({ status: 0, message: "ข้อมูลไม่ครบ" });
        const result = await EvaluationPeriod.update(req.params.id, name, start_date, end_date, status);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const deleteEvaluationPeriod = async (req, res) => {
    try {
        const result = await EvaluationPeriod.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};