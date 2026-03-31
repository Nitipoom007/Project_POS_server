console.log("🔥 NEW CODE VERSION 999");

const express = require('express');
const multer = require('multer');
const upload = multer();
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express(); // ✅ ต้องอยู่ก่อน

// ✅ แล้วค่อยใช้
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.options('*', cors());

app.use(express.json());

const port = process.env.PORT || 8080;

// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'https://projectposserver-production.up.railway.app'
//   ]
// }));

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT), // 👈 สำคัญ
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000 // 👈 กันค้าง
});
// const pool = mysql.createPool({
  // host: process.env.MYSQLHOST,
  // port: process.env.MYSQLPORT,
  // user: process.env.MYSQLUSER,
  // password: process.env.MYSQLPASSWORD,
  // database: process.env.MYSQLDATABASE,
  // waitForConnections: true,
  // connectionLimit: 10,
  // host: 'localhost',
  // user: 'root',
  // // password: '',
  // password: process.env.DB_PASSWORD,
  // database: 'pos',
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
  // host: 'mysql.railway.internal',   // เปลี่ยนจาก localhost
  // host: 'mysql-production-4b8d.up.railway.app',   // เปลี่ยนจาก localhost
  // port: 3306,                        // ใส่ port ของ Railway
  // user: 'root',                      // เปลี่ยนตาม Railway
  // password: 'WUeaNdyRwNLaFOrKJJhvQqOZGRypELvC', // เปลี่ยนตาม Railway
  // database: 'railway',               // เปลี่ยนตาม Railway
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
// });
app.get('/', (req, res) => {
  res.send('OK ROOT WORKING');
});
app.use((req, res, next) => {
  console.log("👉 REQUEST:", req.method, req.url);
  next();
});
app.use((req, res, next) => {
  console.log("👉 REQUEST:", req.method, req.url);
  next();
});
// ----------
app.get('/api/debug-db', async (req, res) => {
  try {
    console.log("Testing DB...");
    const [rows] = await pool.query("SELECT 1");
    res.json({ success: true, rows });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({
      error: err.message,
      full: err
    });
  }
});
//--------------------------login---------------------------------
app.post('/api/userslogin', async (req, res) => {
  console.log('BODY:', req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT user_id, user_name, user_fn, user_status FROM users WHERE user_name = ? AND user_password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.json({
      message: 'Login successful',
      resultuser: rows[0]
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//----------------------------------------------------------------

//--------------------------show users---------------------------------
// app.get('/api/showusers', async (req, res) => {
//   try {
//     const sql = `
//       SELECT 
//         user_id,
//         user_name,
//         user_fn,
//         user_tel,
//         user_address,
//         user_email,
//         user_status
//       FROM Users
//     `;

//     const [rows] = await pool.query(sql);

//     res.json({
//       message: 'success',
//       data: rows
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.get('/api/showusers', async (req, res) => {
  try {
    console.log("Fetching users...");
    const [rows] = await pool.query("SELECT * FROM users");

    console.log("RESULT:", rows);

    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//----------------------------------------------------------------

//-----------------------show product-----------------------------
app.get('/api/showproducts', async (req, res) => {
  try {
    const sql = `
      SELECT
        *,
        c.category_name,
        u.unit_name,
        p.product_detail
      FROM products p
        INNER JOIN category c ON p.category_id = c.category_id
        INNER JOIN unit u ON p.unit_id = u.unit_id;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//----------------------------------------------------------------

//-----------------------show category-----------------------------
app.get('/api/category', async (req, res) => {
  try {
    const sql = `
      SELECT 
        *
      FROM category;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-----------------------------------------------------------------

//-----------------------show unit-----------------------------
app.get('/api/unit', async (req, res) => {
  try {
    const sql = `
      SELECT
        *
      FROM unit;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-------------------------------------------------------------

//-----------------------add product-----------------------------
app.post('/api/addproducts', async (req, res) => {
  console.log('BODY addproducts:', req.body);
  try {
    const {
      barcode, name, categoryID, unitID, price, cost, detail, date, quantity, userID, isUpdate
    } = req.body;

    if (isUpdate) {
      // --- กรณีอัปเดตค่าเดิม ---
      const sqlUpdate = `
        UPDATE products 
        SET product_name = ?, category_id = ?, unit_id = ?, product_price = ?, 
            product_cost = ?, product_detail = ?, product_quantity = ?, date = ?, user_id = ?
        WHERE product_barcode = ?
      `;
      await pool.query(sqlUpdate, [
        name, categoryID, unitID, price, cost, detail, quantity, date, userID, barcode
      ]);
      return res.json({ message: 'Product updated successfully' });

    } else {
      // --- กรณีเพิ่มใหม่ (โค้ดเดิมของคุณ) ---
      const sqlInsert = `
        INSERT INTO products 
        (product_barcode, product_name, category_id, unit_id, product_price, product_cost, product_detail, date, product_quantity, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sqlInsert, [
        barcode, name, categoryID, unitID, price, cost, detail, date, quantity, userID
      ]);
      return res.json({ message: 'Product added successfully', productId: result.insertId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//---------------------------------------------------------------

//-----------------------delete product-----------------------------
app.delete('/api/deleteproduct/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const sql = 'DELETE FROM products WHERE product_id = ?';
    const [result] = await pool.query(sql, [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------

//-----------------------add users-----------------------------
app.post('/api/addusers', upload.none(), async (req, res) => {
  console.log('BODY:', req.body);
  try {
    const {
      fname,
      lname,
      username,
      password,
      email,
      address,
      phone,
      status
    } = req.body;
    const sql = `
      INSERT INTO users
      (user_fn, user_ln, user_name, user_password, user_email, user_address, user_tel, user_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      fname,
      lname,
      username,
      password,
      email,
      address,
      phone,
      status
    ]);
    res.json({
      message: 'User added successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-------------------------------------------------------------

//-----------------------delete users-----------------------------
app.delete('/api/deleteuser/:id', async (req, res) => {
  console.log('Delete User ID:', req.params.id);
  const userId = req.params.id;
  try {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    const [result] = await pool.query(sql, [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//----------------------------------------------------------------

//-----------------------add billitem-----------------------------
app.post('/api/addbillitem', async (req, res) => {
  console.log('BODY addbillitem:', req.body);

  try {
    const { billNo, user_id, products } = req.body;

    if (!billNo || !user_id || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    }

    const sql = `
      INSERT INTO bill_item (bill_no, product_id, quantity, user_id)
      VALUES ?
    `;

    const values = products.map(p => [
      billNo,
      p.product_id,
      p.quantity,   // ✅ ใช้ quantity ของสินค้าโดยตรง และคูณด้วย quantity ที่ส่งมา
      user_id
    ]);

    await pool.query(sql, [values]);

    res.json({ message: 'Bill items added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//---------------------------------------------------------------

//--------------------------report bill-------------------------------
app.post('/api/reportbill', async (req, res) => {
  console.log('BODY report bill:', req.body);

  try {
    const {
      billNo,
      paymentStatus,
      paymentMethod,
      paidDate,
      paidTime,
      total,
      cash
    } = req.body;

    const sql = `
      INSERT INTO report_bill
      (bill_no, payment_status, payment_method, date, time, total, cash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      billNo,
      paymentStatus,
      paymentMethod,
      paidDate,
      paidTime,
      total,
      cash
    ]);

    res.json({ message: 'Report bill added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//--------------------------------------------------------------------

//------------------------ shop --------------------------------------
app.get('/api/shop_address', async (req, res) => {
  try {
    const sql = `
      SELECT 
        *
      FROM shop;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//--------------------------------------------------------------------

//------------------------show report bill -------------------------------
app.get('/api/report', async (req, res) => {
  try {
    const sql = `
      SELECT 
        *
      FROM report_bill;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------show bill item -------------------------------
app.get('/api/bill_item', async (req, res) => {
  try {
    const sql = `
      SELECT p.product_name AS name,SUM(bi.quantity) AS value FROM bill_item bi INNER JOIN products p ON bi.product_id = p.product_id GROUP BY p.product_name ORDER BY value DESC LIMIT 5;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------update_stock-------------------------------
app.post('/api/update_stock', async (req, res) => {
  try {
    const { products } = req.body;

    for (const item of products) {
      const sql = `
        UPDATE products
        SET product_quantity = product_quantity - ?
        WHERE product_id = ?
      `;
      await pool.query(sql, [item.quantity, item.product_id]);
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-------------------------------------------------------------------

//------------------------ total sales -----------------------------------
// app.get('/api/total_sales', async (req, res) => {
//   try {
//     const sql = `
//       SELECT SUM(total) as totalsales FROM Report_bill
//     `;
//     const [rows] = await pool.query(sql);
//     res.json({
//       message: 'success',
//       data: rows[0]
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
//------------------------------------------------------------------------

//------------------------ show profit -----------------------------------
// app.get('/api/profit', async (req, res) => {
//   try {
//     const sql = `
//       SELECT
//     SUM( quantity * pd.product_price - quantity * pd.product_cost ) AS profit
//     FROM
//       bill_item bt
//     JOIN products pd ON
//       bt.product_id = pd.product_id
//     JOIN report_bill rb ON
//       bt.bill_no = rb.bill_no;
//     `;
//     const [rows] = await pool.query(sql);
//     res.json({
//       message: 'success',
//       profit: rows[0].profit ?? 0
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
//------------------------------------------------------------------------

//------------------------ โชว์ยอดขายรายเดือน -----------------------------------
app.get('/api/sales_by_month/:date', async (req, res) => {
  console.log('Fetch sales by month for date:', req.params.date);
  try {
    // const { date } = req.params; // 2026-02
    // const sql = `
    //   // SELECT
    //   //   SUBSTR(DATE, 1, 7) AS DATE,
    //   //   COUNT(*) AS total_bill,
    //   //   SUM(total) AS total_sum
    //   // FROM
    //   //   Report_Bill
    //   // WHERE
    //   //   payment_status = 'paid' AND DATE LIKE ?;
    // `;
    const { date } = req.params;
    const sql = `
    SELECT
      (
        SELECT SUM(total)
        FROM report_bill
        WHERE date LIKE ? 
      ) AS total,

      (
        SELECT COUNT(*)
        FROM report_bill
        WHERE date LIKE ? 
      ) AS total_bill,
      SUM(bt.quantity * pd.product_price - bt.quantity * pd.product_cost) AS profit
    FROM bill_item bt
    JOIN products pd 
      ON bt.product_id = pd.product_id
    JOIN report_bill rb 
      ON bt.bill_no = rb.bill_no
    WHERE rb.date LIKE ? 
    ;`; 
    const [rows] = await pool.query(sql, [`${date}%`, `${date}%`, `${date}%`]);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------ โชว์ยอดขายรายวัน -----------------------------------
app.get('/api/sales_by_day/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `
    SELECT
      COUNT(DISTINCT rb.bill_no) AS total_bill,
      SUM(DISTINCT rb.total) AS total,
      SUM(bt.quantity * pd.product_price - bt.quantity * pd.product_cost) AS profit
    FROM bill_item bt
    JOIN products pd 
      ON bt.product_id = pd.product_id
    JOIN report_bill rb 
      ON bt.bill_no = rb.bill_no
    WHERE rb.date = ?
    `;

    const [rows] = await pool.query(sql, [date]);

    res.json({
      message: 'success',
      data: rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------ เรียกข้อมูลผู้ใช้งานตาม ID -----------------------------------
app.get('/api/getuser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
        user_name,
        user_tel,
        user_email
      FROM users
      WHERE user_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'success',
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//---------------------------------------------------------------------------------

//------------------------ update user -----------------------------------
app.put('/api/updateuser/:id', async (req, res) => {
  const { password, phone } = req.body;
  const { id } = req.params;

  try {
    let sql;
    let params;

    if (password && password !== '') {
      sql = `
        UPDATE users
        SET user_password = ?, user_tel = ?
        WHERE user_id = ?
      `;
      params = [password, phone, id];
    } else {
      sql = `
        UPDATE users
        SET user_tel = ?
        WHERE user_id = ?
      `;
      params = [phone, id];
    }

    await pool.query(sql, params);

    res.json({ message: 'updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'update failed' });
  }
});
//------------------------------------------------------------------------

//------------------------ เรียกข้อมูลสินค้าตาม ID -----------------------------------
app.get('/api/getproduct/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
    pd.product_name,
    pd.product_price,
    pd.product_cost,
    pd.product_detail,
    pd.date,
    pd.product_quantity,
    ct.category_name,
    un.unit_name
FROM
    products pd
    INNER JOIN category ct ON pd.category_id = ct.category_id
    INNER JOIN unit un ON pd.unit_id = un.unit_id

WHERE
    pd.product_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'success',
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-------------------------------------------------------------------------------

//------------------------ update product ---------------------------------------
app.put('/api/updateproduct/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, cost, quantity } = req.body;

    const sql = `
      UPDATE products
      SET product_price = ?,
          product_cost = ?,
          product_quantity = ?
      WHERE product_id = ?
    `;

    await pool.query(sql, [price, cost, quantity, id]);

    res.json({ message: 'update success' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//-------------------------------------------------------------------------------

//------------------------ เรียกข้อมูลร้านค้าตาม ID -----------------------------------
app.get('/api/getshop/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
        shop_name,
        shop_address,
        shop_tel
      FROM shop
      WHERE shop_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    res.json({
      message: 'success',
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//--------------------------------------------------------------------------------

//------------------------ update shop ---------------------------------------
app.put('/api/updateshop/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, shop_address, shop_tel } = req.body;
    const sql = `
      UPDATE shop
      SET shop_name = ?,
          shop_address = ?,
          shop_tel = ?
      WHERE shop_id = ?
    `;
    await pool.query(sql, [shop_name, shop_address, shop_tel, id]);
    res.json({ message: 'update success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//----------------------------------------------------------------------------

//------------------------ promptpay & cash -----------------------------------
app.get('/api/getpromptpay', async (req, res) => {
  try {
    const sql = `
      SELECT
        pm_status
      FROM payment
      WHERE pm_name = 'promptpay';
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/getcash', async (req, res) => {
  try {
    const sql = `
      SELECT
        pm_status
      FROM payment
      WHERE pm_name = 'cash';
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/updatepromptpay', async (req, res) => {
  // console.log('Update PromptPay status:', req.body);
  try {
    const { status } = req.body;
    const sql = `
      UPDATE payment
      SET pm_status = ?
      WHERE pm_name = 'promptpay'
    `;
    await pool.query(sql, [status]);
    res.json({ message: 'update success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/updatecash', async (req, res) => {
  try {
    const { status } = req.body;
    const sql = `
      UPDATE payment
      SET pm_status = ?
      WHERE pm_name = 'cash'
    `;
    await pool.query(sql, [status]);
    res.json({ message: 'update success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//---------------------------------------------------------------------------------

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend บน Windows ทำงานแล้ว 🎉' });
});
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ DB CONNECTED");
    conn.release();
  } catch (err) {
    console.error("❌ DB ERROR:", err);
  }
})();

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at port : ${port}`);
  console.log("🔥 THIS IS NEW CODE");
});
