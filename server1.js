const express = require('express');
const multer = require('multer');
const upload = multer();
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000'
}));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
      'SELECT user_name, user_fn, user_status FROM Users WHERE user_name = ? AND user_password = ?',
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
app.get('/api/showusers', async (req, res) => {
  try {
    const sql = `
      SELECT 
        user_id,
        user_name,
        user_fn,
        user_tel,
        user_address,
        user_email,
        user_status
      FROM Users
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

//-----------------------show product-----------------------------
app.get('/api/showproducts', async (req, res) => {
  try {
    const sql = `
      SELECT
        *,
        c.category_name,
        u.unit_name,
        p.product_detail
      FROM Products p
        INNER JOIN Category c ON p.category_id = c.category_id
        INNER JOIN Unit u ON p.unit_id = u.unit_id;
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
      FROM Category;
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
      FROM Unit;
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
app.post('/api/addproducts', upload.none(), async (req, res) => {
  console.log('BODY:', req.body);

  try {
    const {
      name,
      categoryID,
      unitID,
      price,
      cost,
      detail,
      date,        // ✅ YYYY-MM-DD
      quantity
    } = req.body;

    const sql = `
      INSERT INTO Products
      (product_name, category_id, unit_id, product_price, product_cost, product_detail, date, product_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      name,
      categoryID,
      unitID,
      price,
      cost,
      detail,
      date,       // ✅ เก็บตรง ๆ
      quantity
    ]);

    res.json({
      message: 'Product added successfully',
      productId: result.insertId
    });
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
    const sql = 'DELETE FROM Products WHERE product_id = ?';
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
      INSERT INTO Users
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
    const sql = 'DELETE FROM Users WHERE user_id = ?';
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
      INSERT INTO Report_bill
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
      FROM Report_bill;
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
      SELECT p.product_name AS name,SUM(bi.quantity) AS value FROM bill_item bi INNER JOIN Products p ON bi.product_id = p.product_id GROUP BY p.product_name ORDER BY value DESC LIMIT 5;
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

//------------------------ total sales -----------------------------------
app.get('/api/total_sales', async (req, res) => {
  try {
    const sql = `
      SELECT SUM(total) as totalsales FROM Report_bill
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------ show profit -----------------------------------
app.get('/api/profit', async (req, res) => {
  try {
    const sql = `
      SELECT
    SUM( quantity * pd.product_price - quantity * pd.product_cost ) AS profit
    FROM
      bill_item bt
    JOIN products pd ON
      bt.product_id = pd.product_id
    JOIN report_bill rb ON
      bt.bill_no = rb.bill_no;
    `;
    const [rows] = await pool.query(sql);
    res.json({
      message: 'success',
      profit: rows[0].profit ?? 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------------------------------

//------------------------ โชว์ยอดขายรายเดือน -----------------------------------
app.get('/api/sales_by_month/:date', async (req, res) => {
  try {
    const { date } = req.params; // 2026-02
    const sql = `
      SELECT
        SUBSTR(DATE, 1, 7) AS DATE,
        COUNT(*) AS total_bill,
        SUM(total) AS total_sum
      FROM
        Report_Bill
      WHERE
        payment_status = 'paid' AND DATE LIKE ?;
    `;
    const [rows] = await pool.query(sql, [`${date}%`]);
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend บน Windows ทำงานแล้ว 🎉' });
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
