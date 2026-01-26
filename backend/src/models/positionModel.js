import pool from "../config/db.js";

export default class Position {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM positions ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(name) {
    const [result] = await pool.query(
      "INSERT INTO positions(name) VALUES(?)",
      [name ]
    );
    return result;
  }
  
  static async update(id,name) {
    const [result] = await pool.query(
      "update positions set name=? where id = ?",
      [name, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from positions where id = ?",[id]
    );
    return result;
  }
}
