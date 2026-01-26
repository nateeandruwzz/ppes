import pool from "../config/db.js";

export default class Department {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM departments ");
    return rows;
  }

  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM departments WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(name) {
    const [result] = await pool.query(
      "INSERT INTO departments(name) VALUES(?)",
      [name ]
    );
    return result;
  }
  
  static async update(id,name) {
    const [result] = await pool.query(
      "update departments set name=? where id = ?",
      [name, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from departments where id = ?",[id]
    );
    return result;
  }
}
