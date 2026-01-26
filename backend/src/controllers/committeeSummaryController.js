import CommitteeSummary from "../models/committeeSummaryModel.js";

export const getCommitteeSummaryAll = async (req, res) => {
  try {
    const rows = await CommitteeSummary.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getCommitteeSummaryID = async (req, res) => {
    try {
        const result = await CommitteeSummary.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createCommitteeSummary = async (req, res) => {
    try {
        const { period_id,evaluatee_id,committee_user_id,summary,signature_path } = req.body;
        const result = await CommitteeSummary.create(period_id,evaluatee_id,committee_user_id,summary,signature_path);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateCommitteeSummary = async (req, res) => {
  try {
    const { period_id,evaluatee_id,committee_user_id,summary,signature_path } = req.body;
    const result = await CommitteeSummary.update(req.params.id,period_id,evaluatee_id,committee_user_id,summary,signature_path);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteCommitteeSummary = async (req, res) => {
    try{
        const result = await CommitteeSummary.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};