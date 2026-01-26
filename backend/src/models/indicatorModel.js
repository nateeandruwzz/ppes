import pool from "../config/db.js";

export default class Indicator {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM indicators ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM indicators WHERE id = ?",
      [id]
    );
    return rows;
  }
  static async getByPeriod(period_id) {
    const [rows] = await pool.query(
      "SELECT * FROM indicators WHERE period_id = ?",
      [period_id]
    );
    return rows;
  }

  static async create(name,description,period_id,topic_id,weight,required_evidence) {
    const [result] = await pool.query(
      "INSERT INTO indicators(name,description,period_id,topic_id,weight,required_evidence) VALUES(?,?,?,?,?,?)",
      [name,description,period_id,topic_id,weight,required_evidence]
    );
    return result;
  }
  
  static async update(id,name,description,period_id,topic_id,weight,required_evidence) {
    const [result] = await pool.query(
      "update indicators set name=?,description=?,period_id=?,topic_id=?,weight=?,required_evidence=? where id = ?",
      [name, description, period_id, topic_id, weight, required_evidence, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from indicators where id = ?",[id]
    );
    return result;
  }
}
