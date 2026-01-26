import pool from "../config/db.js";

export default class EvaluationScale {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_scale ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_scale WHERE id = ?",
      [id]
    );
    return rows;
  }
  static async getByPeriod(period_id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_scale WHERE period_id = ?",
      [period_id]
    );
    return rows;
  }
  static async create(period_id, value, name) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_scale(period_id,value,name) VALUES(?,?,?)",
      [period_id, value, name]
    );
    return result;
  }

  static async update(id, period_id, value, name) {
    const [result] = await pool.query(
      "update evaluation_scale set period_id=?,value=?,name=? where id = ?",
      [period_id, value, name, id]
    );
    return result;
  }
  static async updateValue(id, value) {
    const [result] = await pool.query("update evaluation_scale set value=? where id = ?", [value, id]);
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_scale where id = ?", [id]
    );
    return result;
  }
}
