import pool from "../config/db.js";

export default class CommitteeSummary {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM committee_summary ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM committee_summary WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(period_id,evaluatee_id,committee_user_id,summary,signature_path) {
    const [result] = await pool.query(
      "INSERT INTO committee_summary (period_id,evaluatee_id,committee_user_id,summary,signature_path) VALUES (?,?,?,?,?)",
      [ period_id,evaluatee_id,committee_user_id,summary,signature_path ]
    );
    return result;
  }
  
  static async update(id,period_id,evaluatee_id,committee_user_id,summary,signature_path) {
    const [result] = await pool.query(
      "update committee_summary set period_id=?,evaluatee_id=?,committee_user_id=?,,summary=?,signature_path=? where id = ?",
      [period_id,evaluatee_id,committee_user_id,,summary,signature_path,id]
    );
    return result;
  }
  
  static async delete(id) {
    const [result] = await pool.query(
      "delete from committee_summary where id = ?",[id]
    );
    return result;
  }
}