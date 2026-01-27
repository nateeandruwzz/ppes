import pool from "../config/db.js";

export default class Evidence {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evidences ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evidences WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async getByEvaluateeAndIndicator(evaluatee_id, indicator_id) {
    const [rows] = await pool.query(
      "SELECT * FROM evidences WHERE evaluatee_id = ? AND indicator_id = ?",
      [evaluatee_id, indicator_id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async getByEvaluatee(evaluatee_id) {
    const [rows] = await pool.query(
      "SELECT * FROM evidences WHERE evaluatee_id = ?",
      [evaluatee_id]
    );
    return rows;
  }

  static async create(evaluatee_id, indicator_id, file_path, description, url) {
    const [result] = await pool.query(
      "INSERT INTO evidences(evaluatee_id , indicator_id, file_path, description, url) VALUES(?,?,?,?,?)",
      [evaluatee_id, indicator_id, file_path, description, url]
    );
    return result;
  }

  static async update(id, evaluatee_id, indicator_id, file_path, description, url) {
    const [result] = await pool.query(
      "update evidences set evaluatee_id=?, indicator_id=?, file_path=?, description=?, url=? where id = ?",
      [evaluatee_id, indicator_id, file_path, description, url, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evidences where id = ?", [id]
    );
    return result;
  }
}
