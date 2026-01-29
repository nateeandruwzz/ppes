import CommitteeSummary from "../models/committeeSummaryModel.js";

export const saveSummary = async (req, res) => {
    try {
        const { period_id, evaluatee_id, committee_user_id, summary, signature_path } = req.body;

        // Validation
        if (!period_id || !evaluatee_id || !committee_user_id || !signature_path) {
            return res.status(400).json({ status: 0, message: "ข้อมูลไม่ครบถ้วน" });
        }

        // Check if exists
        const existing = await CommitteeSummary.getByEvaluateeAndPeriod(evaluatee_id, period_id);

        let result;
        if (existing.length > 0) {
            // Update
            result = await CommitteeSummary.update(
                existing[0].id,
                period_id,
                evaluatee_id,
                committee_user_id,
                summary || '',
                signature_path
            );
        } else {
            // Create
            result = await CommitteeSummary.create(
                period_id,
                evaluatee_id,
                committee_user_id,
                summary || '',
                signature_path
            );
        }

        if (result) {
            return res.json({ status: 1, message: "บันทึกข้อมูลสำเร็จ" });
        } else {
            return res.status(400).json({ status: 0, message: "บันทึกข้อมูลไม่สำเร็จ" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด", error: err.message });
    }
};

export const getSummary = async (req, res) => {
    try {
        const { periodId, evaluateeId } = req.params;
        const rows = await CommitteeSummary.getByEvaluateeAndPeriod(evaluateeId, periodId);

        if (rows.length > 0) {
            return res.json({ status: 1, message: "สำเร็จ", data: rows[0] });
        } else {
            return res.json({ status: 0, message: "ไม่พบข้อมูล" });
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};


export const getAllSummaries = async (req, res) => {
    try {
        const rows = await CommitteeSummary.getAll();
        return res.json({ status: 1, message: "สำเร็จ", data: rows });
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};
