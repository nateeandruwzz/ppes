import pool from "../config/db.js";

export default class User {

  static async getByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  }
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM users ");
    return rows;
  }
  static async getByRole(role="Evaluatee") {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE role = ?",
      [role]
    );
    return rows;
  }
  static async getByID(id) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows;
  }

  static async create(prefix, first_name, last_name, hash, email, phone, role="Evaluatee") {
    const [result] = await pool.query(
      "INSERT INTO users(prefix, first_name, last_name, password, email, phone, role) VALUES(?,?,?,?,?,?,?)",
      [prefix, first_name, last_name, hash, email, phone, role]
    );
    return result;
  }
  
  static async update(id,prefix, first_name, last_name, email, phone) {
    const [result] = await pool.query(
      "update users set prefix=?, first_name=?, last_name=?, email=?, phone=? where id = ?",
      [prefix, first_name, last_name, email, phone, id]
    );
    return result;
  }

  static async updatePassword(id,hash) {
    const [result] = await pool.query(
      "update users set password=? where id = ?",
      [hash, id]
    );
    return result;
  }

  static async updateRole(id,role) {
    const [result] = await pool.query(
      "update users set role=? where id = ?",
      [role, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query(
      "delete from users where id = ?",[id]
    );
    return result;
  }
}
