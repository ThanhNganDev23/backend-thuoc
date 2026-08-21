const express = require('express');
const cors = require('cors');
const getDB = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Lấy danh sách thuốc (kèm Tìm kiếm & Lọc)
app.get('/api/medicines', async (req, res) => {
  try {
    const db = await getDB();
    const { search, status } = req.query;
    
    let query = `SELECT * FROM medicines WHERE 1=1`;
    let params = [];

    if (search) {
      query += ` AND (name LIKE ? OR disease_codes LIKE ? OR indications LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id DESC`;

    const medicines = await db.all(query, params);
    res.json({ success: true, data: medicines, total: medicines.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Thêm mới thuốc
app.post('/api/medicines', async (req, res) => {
  try {
    const {
      name, disease_codes, indications, contraindications,
      status, previously_refunded, effective_date, other_requirements
    } = req.body;

    // Validation cơ bản ở backend
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tên thuốc là bắt buộc!' });
    }

    const db = await getDB();
    const result = await db.run(
      `INSERT INTO medicines 
        (name, disease_codes, indications, contraindications, status, previously_refunded, effective_date, other_requirements) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        disease_codes || '',
        indications || '',
        contraindications || '',
        status || 'Còn hạn',
        previously_refunded || 'Không',
        effective_date || '',
        other_requirements || ''
      ]
    );

    const newMedicine = await db.get(`SELECT * FROM medicines WHERE id = ?`, [result.lastID]);

    res.status(201).json({ success: true, data: newMedicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Xóa thuốc
app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.run(`DELETE FROM medicines WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
