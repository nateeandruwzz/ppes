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

// ============================================
// NEW: API สำหรับคำนวณและดึงข้อมูลจาก Backend
// ============================================

import SelfEvaluation from "../models/selfEvaluationModel.js";
import EvaluationCommittee from "../models/evaluationCommitteeModel.js";
import Evaluatee from "../models/evaluateeModel.js";
import pool from "../config/db.js";

// 1. API ดึงข้อมูล Tracking (สถานะการส่งประเมิน)
export const getTrackingData = async (req, res) => {
    try {
        const { period_id } = req.params;
        if (!period_id) {
            return res.status(400).json({ status: 0, message: "กรุณาระบุ period_id" });
        }

        // ดึงข้อมูลที่จำเป็น
        const [evaluatees] = await pool.query("SELECT * FROM evaluatees");
        const [selfEvaluations] = await pool.query("SELECT * FROM self_evaluations WHERE period_id = ?", [period_id]);
        const [committeeEvaluations] = await pool.query("SELECT * FROM committee_evaluations WHERE period_id = ?", [period_id]);
        const [committees] = await pool.query("SELECT * FROM evaluation_committee WHERE period_id = ?", [period_id]);
        const [users] = await pool.query("SELECT id, first_name, last_name FROM users");
        const [departments] = await pool.query("SELECT * FROM departments");
        const [positions] = await pool.query("SELECT * FROM positions");

        // สร้างข้อมูล tracking
        const trackingData = evaluatees.map(evaluatee => {
            const user = users.find(u => u.id === evaluatee.user_id);
            const dept = departments.find(d => d.id === evaluatee.department_id);
            const pos = positions.find(p => p.id === evaluatee.position_id);

            // ตรวจสอบการประเมินตนเอง
            const hasSelfEval = selfEvaluations.some(e => e.evaluatee_id === evaluatee.id);

            // จำนวนกรรมการที่ประเมินแล้ว
            const assignedCommittees = committees.filter(c => c.evaluatee_id === evaluatee.id);
            const completedCommittees = assignedCommittees.filter(c => {
                return committeeEvaluations.some(e =>
                    e.evaluatee_id === evaluatee.id &&
                    e.committee_user_id === c.committee_user_id
                );
            });

            const status = hasSelfEval && completedCommittees.length >= assignedCommittees.length ? 'completed' :
                (hasSelfEval || completedCommittees.length > 0) ? 'in_progress' : 'pending';

            return {
                id: evaluatee.id,
                name: user ? `${user.first_name} ${user.last_name}` : '-',
                department: dept?.name || '-',
                position: pos?.name || '-',
                selfEval: hasSelfEval,
                totalCommittees: assignedCommittees.length,
                completedCommittees: completedCommittees.length,
                status
            };
        });

        // สรุปสถิติ
        const stats = {
            total: trackingData.length,
            completed: trackingData.filter(d => d.status === 'completed').length,
            inProgress: trackingData.filter(d => d.status === 'in_progress').length,
            pending: trackingData.filter(d => d.status === 'pending').length
        };

        return res.json({
            status: 1,
            message: "สำเร็จ",
            data: { trackingData, stats }
        });

    } catch (err) {
        console.error("Tracking Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

// 2. API ดึงข้อมูล Report (คะแนนทุกคน)
export const getReportData = async (req, res) => {
    try {
        const { period_id } = req.params;
        if (!period_id) {
            return res.status(400).json({ status: 0, message: "กรุณาระบุ period_id" });
        }

        // ดึงข้อมูล
        const [evaluatees] = await pool.query("SELECT * FROM evaluatees");
        const [indicators] = await pool.query("SELECT * FROM indicators WHERE period_id = ?", [period_id]);
        const [scales] = await pool.query("SELECT * FROM evaluation_scale WHERE period_id = ?", [period_id]);
        const [selfEvaluations] = await pool.query("SELECT * FROM self_evaluations WHERE period_id = ?", [period_id]);
        const [committeeEvaluations] = await pool.query("SELECT * FROM committee_evaluations WHERE period_id = ?", [period_id]);
        const [users] = await pool.query("SELECT id, first_name, last_name FROM users");
        const [departments] = await pool.query("SELECT * FROM departments");
        const [positions] = await pool.query("SELECT * FROM positions");

        const maxScale = scales.length > 0 ? Math.max(...scales.map(s => s.value)) : 5;

        // คำนวณคะแนนแต่ละคน
        const reportData = evaluatees.map(evaluatee => {
            const user = users.find(u => u.id === evaluatee.user_id);
            const dept = departments.find(d => d.id === evaluatee.department_id);
            const pos = positions.find(p => p.id === evaluatee.position_id);

            let selfScore = 0;
            let selfCount = 0;
            let committeeScore = 0;

            indicators.forEach(ind => {
                // คะแนนตนเอง
                const selfEval = selfEvaluations.find(e =>
                    e.evaluatee_id === evaluatee.id && e.indicator_id === ind.id
                );
                if (selfEval) {
                    selfScore += (Number(selfEval.score) / maxScale) * Number(ind.weight);
                    selfCount++;
                }

                // คะแนนกรรมการ (เฉลี่ย)
                const commEvals = committeeEvaluations.filter(e =>
                    e.evaluatee_id === evaluatee.id && e.indicator_id === ind.id
                );
                if (commEvals.length > 0) {
                    const avgScore = commEvals.reduce((sum, e) => sum + Number(e.score), 0) / commEvals.length;
                    committeeScore += (avgScore / maxScale) * Number(ind.weight);
                }
            });

            const hasData = selfCount > 0 || committeeScore > 0;
            const totalScore = hasData ? (selfScore + committeeScore) / 2 : null;

            return {
                id: evaluatee.id,
                name: user ? `${user.first_name} ${user.last_name}` : '-',
                department: dept?.name || '-',
                position: pos?.name || '-',
                selfScore: selfCount > 0 ? selfScore.toFixed(2) : '-',
                committeeScore: committeeScore > 0 ? committeeScore.toFixed(2) : '-',
                totalScore: totalScore !== null ? totalScore.toFixed(2) : '-'
            };
        }).sort((a, b) => {
            if (a.totalScore === '-') return 1;
            if (b.totalScore === '-') return -1;
            return Number(b.totalScore) - Number(a.totalScore);
        });

        // สถิติภาพรวม
        const validScores = reportData.filter(d => d.totalScore !== '-').map(d => Number(d.totalScore));
        const orgStats = {
            avg: validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2) : '-',
            max: validScores.length > 0 ? Math.max(...validScores).toFixed(2) : '-',
            min: validScores.length > 0 ? Math.min(...validScores).toFixed(2) : '-'
        };

        return res.json({
            status: 1,
            message: "สำเร็จ",
            data: { reportData, orgStats }
        });

    } catch (err) {
        console.error("Report Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

// 3. API ดึงสรุปคะแนน Evaluatee คนเดียว (สำหรับ CommitteeSummary)
export const getEvaluateeSummary = async (req, res) => {
    try {
        const { period_id, evaluatee_id } = req.params;
        if (!period_id || !evaluatee_id) {
            return res.status(400).json({ status: 0, message: "กรุณาระบุ period_id และ evaluatee_id" });
        }

        // ดึงข้อมูล
        const [indicators] = await pool.query("SELECT * FROM indicators WHERE period_id = ?", [period_id]);
        const [scales] = await pool.query("SELECT * FROM evaluation_scale WHERE period_id = ?", [period_id]);
        const [selfEvaluations] = await pool.query(
            "SELECT * FROM self_evaluations WHERE period_id = ? AND evaluatee_id = ?",
            [period_id, evaluatee_id]
        );
        const [committeeEvaluations] = await pool.query(
            "SELECT * FROM committee_evaluations WHERE period_id = ? AND evaluatee_id = ?",
            [period_id, evaluatee_id]
        );
        const [evaluatee] = await pool.query("SELECT * FROM evaluatees WHERE id = ?", [evaluatee_id]);
        const [users] = await pool.query("SELECT id, first_name, last_name FROM users");
        const [departments] = await pool.query("SELECT * FROM departments");
        const [positions] = await pool.query("SELECT * FROM positions");

        if (!evaluatee[0]) {
            return res.json({ status: 0, message: "ไม่พบผู้รับการประเมิน" });
        }

        const maxScale = scales.length > 0 ? Math.max(...scales.map(s => s.value)) : 5;
        const user = users.find(u => u.id === evaluatee[0].user_id);
        const dept = departments.find(d => d.id === evaluatee[0].department_id);
        const pos = positions.find(p => p.id === evaluatee[0].position_id);

        let selfTotal = 0;
        let committeeTotal = 0;

        indicators.forEach(ind => {
            const selfEval = selfEvaluations.find(e => e.indicator_id === ind.id);
            if (selfEval) {
                selfTotal += (Number(selfEval.score) / maxScale) * Number(ind.weight);
            }

            const commEvals = committeeEvaluations.filter(e => e.indicator_id === ind.id);
            if (commEvals.length > 0) {
                const avg = commEvals.reduce((sum, e) => sum + Number(e.score), 0) / commEvals.length;
                committeeTotal += (avg / maxScale) * Number(ind.weight);
            }
        });

        const averageScore = (selfTotal + committeeTotal) / 2;

        return res.json({
            status: 1,
            message: "สำเร็จ",
            data: {
                evaluatee: {
                    id: evaluatee[0].id,
                    name: user ? `${user.first_name} ${user.last_name}` : '-',
                    department: dept?.name || '-',
                    position: pos?.name || '-'
                },
                scores: {
                    selfScore: selfTotal.toFixed(2),
                    committeeScore: committeeTotal.toFixed(2),
                    averageScore: averageScore.toFixed(2)
                }
            }
        });

    } catch (err) {
        console.error("Summary Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};