import CommitteeEvaluation from "../models/committeeEvaluationModel.js";

export const getCommitteeEvaluationAll = async (req, res) => {
  try {
    const rows = await CommitteeEvaluation.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getCommitteeEvaluationID = async (req, res) => {
    try {
        const result = await CommitteeEvaluation.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createCommitteeEvaluation = async (req, res) => {
    try {
        const { period_id,evaluatee_id,committee_user_id,indicator_id,score,comment } = req.body;
        const result = await CommitteeEvaluation.create(period_id,evaluatee_id,committee_user_id,indicator_id,score,comment);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateCommitteeEvaluation = async (req, res) => {
  try {
    const { period_id,evaluatee_id,committee_user_id,indicator_id,score,comment } = req.body;
    const result = await CommitteeEvaluation.update(req.params.id,period_id,evaluatee_id,committee_user_id,indicator_id,score,comment);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const updateCommitteeEvaluationScore = async (req, res) => {
  try {
    const { score } = req.body;
    const result = await CommitteeEvaluation.update(req.params.id,score);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteCommitteeEvaluation = async (req, res) => {
    try{
        const result = await CommitteeEvaluation.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};