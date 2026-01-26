import pool from "../config/db.js";

export default class EvaluationTopic {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM evaluation_topics ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM evaluation_topics WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(name, description) {
    const [result] = await pool.query(
      "INSERT INTO evaluation_topics(name, description) VALUES(?,?)",
      [name, description ]
    );
    return result;
  }
  
  static async update(id,name, description) {
    const [result] = await pool.query(
      "update evaluation_topics set name=?, description=? where id = ?",
      [name, description, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from evaluation_topics where id = ?",[id]
    );
    return result;
  }
}
