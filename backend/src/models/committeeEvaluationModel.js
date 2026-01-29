import pool from "../config/db.js";

export default class CommitteeEvaluation {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM committee_evaluations ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM committee_evaluations WHERE id = ?",
      [id]
    );
    return rows;
  }
  static async getByPeriodAndEvaluatee(period_id, evaluatee_id) {
    const [rows] = await pool.query(
      "SELECT * FROM committee_evaluations WHERE period_id = ? AND evaluatee_id = ?",
      [period_id, evaluatee_id]
    );
    return rows;
  }
  static async create(period_id, evaluatee_id, committee_user_id, indicator_id, score, comment) {
    const [result] = await pool.query(
      "INSERT INTO committee_evaluations (period_id,evaluatee_id,committee_user_id,indicator_id,score,comment) VALUES (?,?,?,?,?,?)",
      [period_id, evaluatee_id, committee_user_id, indicator_id, score, comment]
    );
    return result;
  }

  static async update(id, period_id, evaluatee_id, committee_user_id, indicator_id, score, comment) {
    const [result] = await pool.query(
      "update committee_evaluations set period_id=?,evaluatee_id=?,committee_user_id=?,indicator_id=?,score=?,comment=? where id = ?",
      [period_id, evaluatee_id, committee_user_id, indicator_id, score, comment, id]
    );
    return result;
  }

  static async updateScore(id, score) {
    const [result] = await pool.query(
      "update committee_evaluations set score=? where id = ?", [score, id]);
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from committee_evaluations where id = ?", [id]
    );
    return result;
  }

  static async deleteByIndicator(indicator_id) {
    const [result] = await pool.query(
      "DELETE FROM committee_evaluations WHERE indicator_id = ?", [indicator_id]
    );
    return result;
  }
}