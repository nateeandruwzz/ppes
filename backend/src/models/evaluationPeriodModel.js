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

  // Get periods that a user is assigned to as evaluatee
  static async getByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT DISTINCT ep.* FROM evaluation_periods ep
       INNER JOIN evaluatees e ON e.period_id = ep.id
       WHERE e.user_id = ?
       ORDER BY ep.id DESC`,
      [userId]
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

  static async update(id, name, start_date, end_date, status) {
    const [result] = await pool.query(
      "update evaluation_periods set name=?, start_date=?, end_date=?, status=? where id = ?",
      [name, start_date, end_date, status, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_periods where id = ?", [id]
    );
    return result;
  }
}
