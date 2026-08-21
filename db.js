const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Khởi tạo bảng danh mục thuốc
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      disease_codes TEXT,
      indications TEXT,
      contraindications TEXT,
      status TEXT CHECK(status IN ('Còn hạn', 'Hết hạn', 'Tạm ngưng')) DEFAULT 'Còn hạn',
      previously_refunded TEXT,
      effective_date TEXT,
      other_requirements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return dbInstance;
}

module.exports = getDB;
