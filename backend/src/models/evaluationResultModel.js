import pool from "../config/db.js";

export default class EvaluationResult {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_results ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_results WHERE id = ?",
      [id]
    );
    return rows;
  }
  static async getByPeriodAndEvaluatee(period_id, evaluatee_id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_results WHERE period_id = ? AND evaluatee_id = ?",
      [period_id, evaluatee_id]
    );
    return rows[0];
  }
  static async create(period_id, evaluatee_id, total_score, average_score) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_results(period_id, evaluatee_id, total_score, average_score) VALUES(?, ?, ?, ?)",
      [period_id, evaluatee_id, total_score, average_score]
    );
    return result;
  }

  static async update(id, period_id, evaluatee_id, total_score, average_score) {
    const [result] = await pool.query(
      "UPDATE evaluation_results SET period_id=?, evaluatee_id=?, total_score=?, average_score=? WHERE id = ?",
      [period_id, evaluatee_id, total_score, average_score, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_results where id = ?", [id]
    );
    return result;
  }
}
