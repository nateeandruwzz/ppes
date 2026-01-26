import pool from "../config/db.js";

export default class EvaluationCommittee {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_committee ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_committee WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(period_id,evaluatee_id,committee_user_id) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_committee (period_id,evaluatee_id,committee_user_id) VALUES (?,?,?)",
      [ period_id,evaluatee_id,committee_user_id ]
    );
    return result;
  }
  
  static async update(id,period_id,evaluatee_id,committee_user_id) {
    const [result] = await pool.query(
      "update evaluation_committee set period_id=?,evaluatee_id=?,committee_user_id=? where id = ?",
      [period_id,evaluatee_id,committee_user_id,id]
    );
    return result;
  }
  
  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_committee where id = ?",[id]
    );
    return result;
  }
}