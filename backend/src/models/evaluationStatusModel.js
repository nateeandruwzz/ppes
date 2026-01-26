import pool from "../config/db.js";

export default class EvaluationStatus {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_status ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_status WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(period_id,evaluatee_id,committee_user_id,status) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_status(period_id,evaluatee_id,committee_user_id,status) VALUES(?,?,?,?)",
      [ period_id,evaluatee_id,committee_user_id,status ]
    );
    return result;
  }
  
  static async update(id,period_id,evaluatee_id,committee_user_id,status) {
    const [result] = await pool.query(
      "update evaluation_status set period_id=?,evaluatee_id=?,committee_user_id=?,status=? where id = ?",
      [period_id,evaluatee_id,committee_user_id,status,id]
    );
    return result;
  }
  static async updateStatus(id,status) {
    const [result] = await pool.query(
      "update evaluation_status set status=? where id = ?",
      [status,id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_status where id = ?",[id]
    );
    return result;
  }
}
