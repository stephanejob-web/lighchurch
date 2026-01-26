const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireSuperAdmin } = require('../middleware/authMiddleware');

// --- Helper for generic CRUD ---
const createCrud = (table, columns) => {
    // GET (Public) - List all active items
    router.get(`/${table}`, async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY id ASC`);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST (Super Admin) - Create
    router.post(`/${table}`, verifyToken, requireSuperAdmin, async (req, res) => {
        try {
            const keys = Object.keys(req.body).filter(k => columns.includes(k));
            const values = keys.map(k => req.body[k]);

            if (keys.length === 0) return res.status(400).json({ message: 'No valid fields provided' });

            const placeholders = keys.map(() => '?').join(',');
            const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

            const [result] = await db.query(sql, values);
            res.status(201).json({ id: result.insertId, ...req.body });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT (Super Admin) - Update
    router.put(`/${table}/:id`, verifyToken, requireSuperAdmin, async (req, res) => {
        try {
            const keys = Object.keys(req.body).filter(k => columns.includes(k));
            const values = keys.map(k => req.body[k] === '' ? null : req.body[k]);

            if (keys.length === 0) return res.status(400).json({ message: 'No valid fields provided' });

            const setClause = keys.map(k => `${k} = ?`).join(', ');
            const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

            await db.query(sql, [...values, req.params.id]);
            res.json({ message: 'Updated successfully', id: req.params.id });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE (Super Admin) - Soft delete or Hard delete depending on table
    // For now hard delete for simplicity in "settings"
    router.delete(`/${table}/:id`, verifyToken, requireSuperAdmin, async (req, res) => {
        try {
            await db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// --- Define Routes ---

// Languages
createCrud('languages', ['code', 'name_native', 'name_fr', 'flag_emoji', 'is_active']);

// Activity Types
createCrud('activity_types', ['name', 'label_fr', 'icon']);

// Church Unions
createCrud('church_unions', ['name', 'abbreviation', 'website', 'is_active']);

// Denominations
createCrud('denominations', ['name', 'abbreviation', 'union_id', 'is_active']);

module.exports = router;
