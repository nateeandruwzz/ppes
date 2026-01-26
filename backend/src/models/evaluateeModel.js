import pool from "../config/db.js";

export default class Evaluatee {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluatees ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluatees WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(user_id,position_id,department_id,period_id) {
    const [result] = await pool.query(
      "INSERT INTO evaluatees(user_id,position_id,department_id,period_id) VALUES(?,?,?,?)",
      [ user_id,position_id,department_id,period_id ]
    );
    return result;
  }
  
  static async update(id,user_id,position_id,department_id,period_id) {
    const [result] = await pool.query(
      "update evaluatees set user_id=?,position_id=?,department_id=?,period_id=? where id = ?",
      [user_id,position_id,department_id,period_id,id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluatees where id = ?",[id]
    );
    return result;
  }
}
