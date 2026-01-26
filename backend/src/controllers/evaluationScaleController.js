import EvaluationScale from "../models/evaluationScaleModel.js";

export const getEvaluationScaleAll = async (req, res) => {
  try {
    const rows = await EvaluationScale.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getEvaluationScaleID = async (req, res) => {
    try {
        const result = await EvaluationScale.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createEvaluationScale = async (req, res) => {
    try {
        const { pariod_id,value,name } = req.body;
        const result = await EvaluationScale.create(pariod_id,value,name);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateEvaluationScale = async (req, res) => {
  try {
    const { pariod_id,value,name } = req.body;
    const result = await EvaluationScale.update(req.params.id, pariod_id,value,name);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const updateEvaluationScaleValue = async (req, res) => {
  try {
    const { value } = req.body;
    const result = await EvaluationScale.update(req.params.id,value);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteEvaluationScale = async (req, res) => {
    try{
        const result = await EvaluationScale.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};