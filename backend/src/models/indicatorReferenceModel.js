import pool from "../config/db.js";

export default class IndicatorReference {
    static async create(indicator_id, ref_type, ref_name, ref_path) {
        const [result] = await pool.query(
            "INSERT INTO indicator_references (indicator_id, ref_type, ref_name, ref_path) VALUES (?, ?, ?, ?)",
            [indicator_id, ref_type, ref_name, ref_path]
        );
        return result;
    }

    static async getByIndicator(indicator_id) {
        const [rows] = await pool.query(
            "SELECT * FROM indicator_references WHERE indicator_id = ? ORDER BY created_at DESC",
            [indicator_id]
        );
        return rows;
    }

    static async delete(id) {
        const [result] = await pool.query(
            "DELETE FROM indicator_references WHERE id = ?",
            [id]
        );
        return result;
    }
}
