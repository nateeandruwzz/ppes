import Department from "../models/departmentModel.js";

export const getDepartmentAll = async (req, res) => {
  try {
    const rows = await Department.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getDepartmentID = async (req, res) => {
    try {
        const result = await Department.getByID(req.params.id);
        if(!result){
            res.json({status: 0, message: "ไม่พบข้อมูล"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: result});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        const result = await Department.create(name);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "สำเร็จ", data: result });
        }else{
            return res.status(400).json({status: 0, message: "ไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await Department.update(req.params.id, name);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
    }
    res.json({ status: 1, message: "สำเร็จ" ,data: result});
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const deleteDepartment = async (req, res) => {
    try{
        const result = await Department.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบข้อมูล" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};