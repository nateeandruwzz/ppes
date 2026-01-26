import EvaluationResult from "../models/evaluationResultModel.js";
import CommitteeEvaluation from "../models/committeeEvaluationModel.js";
import Indicator from "../models/indicatorModel.js";
import EvaluationScale from "../models/evaluationScaleModel.js";

// Helper to calculate totals
const calculateTotals = async (period_id, evaluatee_id) => {
    // 1. Fetch Data
    const committeeEvals = await CommitteeEvaluation.getByPeriodAndEvaluatee(period_id, evaluatee_id);
    const indicators = await Indicator.getByPeriod(period_id);
    const scales = await EvaluationScale.getByPeriod(period_id);

    // Find Max Scale
    const maxScale = scales.length > 0 ? Math.max(...scales.map(s => s.value)) : 5; // Default 5

    // 2. Process Indicators
    let totalWeightedScore = 0;
    let totalRawScore = 0; // Sum of averages

    // Formula: (AvgScore / MaxScale) * Weight
    // e.g. (4 / 5) * 20 = 16

    for (const indicator of indicators) {
        // Filter evaluations for this indicator
        const evals = committeeEvals.filter(e => e.indicator_id === indicator.id);

        if (evals.length > 0) {
            // Calculate Average for this indicator (if multiple committees)
            const sumScore = evals.reduce((sum, e) => sum + Number(e.score), 0);
            const avgScore = sumScore / evals.length;

            // Calculate Weighted Score
            const weight = Number(indicator.weight) || 0;

            // Calc
            const weighted = (avgScore / maxScale) * weight;

            totalWeightedScore += weighted;
            totalRawScore += avgScore; // Just for reference
        }
    }

    return {
        total_score: totalWeightedScore.toFixed(2),
        average_score: (indicators.length > 0 ? totalRawScore / indicators.length : 0).toFixed(2) // Avg Raw Score
    };
};

export const summarizeEvaluation = async (req, res) => {
    try {
        const { period_id, evaluatee_id } = req.body;
        if (!period_id || !evaluatee_id) {
            return res.status(400).json({ status: 0, message: "ข้อมูลไม่ครบถ้วน (period_id, evaluatee_id)" });
        }

        // Calculate
        const result = await calculateTotals(period_id, evaluatee_id);

        // Check existing
        const existing = await EvaluationResult.getByPeriodAndEvaluatee(period_id, evaluatee_id);

        let dbResult;
        if (existing) {
            dbResult = await EvaluationResult.update(existing.id, period_id, evaluatee_id, result.total_score, result.average_score);
        } else {
            dbResult = await EvaluationResult.create(period_id, evaluatee_id, result.total_score, result.average_score);
        }

        return res.json({
            status: 1,
            message: "สรุปผลคะแนนสำเร็จ",
            data: {
                ...result,
                period_id,
                evaluatee_id
            }
        });

    } catch (err) {
        console.error("Summarize Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getEvaluationResultAll = async (req, res) => {
    try {
        const rows = await EvaluationResult.getAll();
        if (rows.length > 0) {
            return res.json({ status: 1, message: "สำเร็จ", data: rows });
        } else {
            return res.json({ status: 0, message: "ไม่พบข้อมูล" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getEvaluationResultID = async (req, res) => {
    try {
        const result = await EvaluationResult.getByID(req.params.id);
        if (!result) {
            res.json({ status: 0, message: "ไม่พบข้อมูล" });
        } else {
            res.json({ status: 1, message: "สำเร็จ", data: result });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createEvaluationResult = async (req, res) => {
    try {
        const { period_id, evaluatee_id, total_score, average_score } = req.body;
        const result = await EvaluationResult.create(period_id, evaluatee_id, total_score, average_score);
        if (result.insertId > 0) {
            return res.status(201).json({ status: 1, message: "สำเร็จ", data: result });
        } else {
            return res.status(400).json({ status: 0, message: "ไม่สำเร็จ" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateEvaluationResult = async (req, res) => {
    try {
        const { period_id, evaluatee_id, total_score, average_score } = req.body;
        const result = await EvaluationResult.update(req.params.id, period_id, evaluatee_id, total_score, average_score);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const deleteEvaluationResult = async (req, res) => {
    try {
        const result = await EvaluationResult.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({ status: 1, message: "สำเร็จ", data: result });
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};