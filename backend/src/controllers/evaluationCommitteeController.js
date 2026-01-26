import EvaluationCommittee from "../models/evaluationCommitteeModel.js";

export const getEvaluationCommitteeAll = async (req, res) => {
  try {
    const rows = await EvaluationCommittee.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getEvaluationCommitteeID = async (req, res) => {
    try {
        const result = await EvaluationCommittee.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createEvaluationCommittee = async (req, res) => {
    try {
        const { period_id,evaluatee_id,committee_user_id } = req.body;
        const result = await EvaluationCommittee.create(period_id,evaluatee_id,committee_user_id);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด", errror: err });
    }
};

export const updateEvaluationCommittee = async (req, res) => {
  try {
    const { period_id,evaluatee_id,committee_user_id } = req.body;
    const result = await EvaluationCommittee.update(req.params.id,period_id,evaluatee_id,committee_user_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteEvaluationCommittee = async (req, res) => {
    try{
        const result = await EvaluationCommittee.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};