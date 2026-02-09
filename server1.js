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
      detail,
      date,        // ✅ YYYY-MM-DD
      quantity
    } = req.body;

    const sql = `
      INSERT INTO Products
      (product_name, category_id, unit_id, product_price, product_detail, date, product_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      name,
      categoryID,
      unitID,
      price,
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

    if (!billNo || !user_id || !Array.isArray(products)) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    }

    const sql = `
      INSERT INTO Bill_Item (bill_no, product_id, quantity, user_id)
      VALUES ?
    `;

    const values = products.map(p => [
      billNo,
      p.product_id,
      p.quantity,
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend บน Windows ทำงานแล้ว 🎉' });
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
