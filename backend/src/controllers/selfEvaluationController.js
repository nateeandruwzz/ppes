import SelfEvaluation from "../models/selfEvaluationModel.js";

export const getSelfEvaluationAll = async (req, res) => {
  try {
    const rows = await SelfEvaluation.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getSelfEvaluationID = async (req, res) => {
    try {
        const result = await SelfEvaluation.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createSelfEvaluation = async (req, res) => {
    try {
        const { period_id,evaluatee_id,indicator_id,score,comment } = req.body;
        const result = await SelfEvaluation.create(period_id,evaluatee_id,indicator_id,score,comment);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateSelfEvaluation = async (req, res) => {
  try {
    const { period_id,evaluatee_id,indicator_id,score,comment } = req.body;
    const result = await SelfEvaluation.update(req.params.id,period_id,evaluatee_id,indicator_id,score,comment);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const updateSelfEvaluationScore = async (req, res) => {
  try {
    const { score } = req.body;
    const result = await SelfEvaluation.updateScore(req.params.id, score);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const updateSelfEvaluationComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const result = await SelfEvaluation.updateComment(req.params.id, comment);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteSelfEvaluation = async (req, res) => {
    try{
        const result = await SelfEvaluation.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};