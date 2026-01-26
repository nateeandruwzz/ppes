import pool from "../config/db.js";

export default class EvaluationPeriod {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_periods ORDER BY id DESC");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_periods WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(name, start_date, end_date, status) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_periods(name, start_date, end_date, status) VALUES(?,?,?,?)",
      [name, start_date, end_date, status]
    );
    return result;
  }
  
  static async update(id,name,start_date,end_date,status) {
    const [result] = await pool.query(
      "update evaluation_periods set name=?, start_date=?, end_date=?, status=? where id = ?",
      [name, start_date, end_date, status, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_periods where id = ?",[id]
    );
    return result;
  }
}
