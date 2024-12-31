import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Replace with your MySQL username
  password: 'root',  // Replace with your MySQL password
  database: 'testdb',  // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);  // Exit if connection fails
  } else {
    console.log('Connected to MySQL database');
  }
});

const app = express();

// Middleware to parse JSON data
app.use(express.json());  // Using express built-in JSON parser

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow frontend requests from localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// POST route to handle address data (Create)
app.post('/api/addresses', (req, res) => {
  const { houseNumber, road, category, latitude, longitude } = req.body;

  // Validate required fields
  if (!houseNumber || !road || !category || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Save the address to the database
  const query = `
    INSERT INTO addresses (houseNumber, road, category, latitude, longitude)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [houseNumber, road, category, latitude, longitude], (err, results) => {
    if (err) {
      console.error('Error saving address:', err.message);
      return res.status(500).json({ message: 'Failed to save address' });
    }

    // Send a success response with the inserted ID
    res.status(200).json({
      message: 'Address saved successfully',
      id: results.insertId
    });
  });
});

// GET route to retrieve all addresses (Read)
app.get('/api/addresses', (req, res) => {
  const query = 'SELECT * FROM addresses';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching addresses:', err.message);
      return res.status(500).json({ message: 'Failed to fetch addresses' });
    }
    res.status(200).json(results);
  });
});

// PUT route to update an address by ID (Update)
app.put('/api/addresses/:id', (req, res) => {
  const { id } = req.params;
  const { houseNumber, road, category, latitude, longitude } = req.body;

  // Validate required fields
  if (!houseNumber || !road || !category || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Update the address in the database
  const query = `
    UPDATE addresses
    SET houseNumber = ?, road = ?, category = ?, latitude = ?, longitude = ?
    WHERE id = ?
  `;

  connection.query(query, [houseNumber, road, category, latitude, longitude, id], (err, results) => {
    if (err) {
      console.error('Error updating address:', err.message);
      return res.status(500).json({ message: 'Failed to update address' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ message: 'Address updated successfully' });
  });
});

// DELETE route to delete an address by ID (Delete)
app.delete('/api/addresses/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM addresses WHERE id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting address:', err.message);
      return res.status(500).json({ message: 'Failed to delete address' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  });
});

// Server listener
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// import express from 'express';
// import cors from 'cors';
// import mysql from 'mysql2';

// // Create MySQL connection
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',  // Replace with your MySQL username
//   password: 'root',  // Replace with your MySQL password
//   database: 'testdb',  // Replace with your database name
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//     process.exit(1);  // Exit if connection fails
//   } else {
//     console.log('Connected to MySQL database');
//   }
// });

// const app = express();

// // Middleware to parse JSON data
// app.use(express.json());  // Using express built-in JSON parser

// // CORS configuration
// const corsOptions = {
//   origin: 'http://localhost:3000', // Allow frontend requests from localhost:3000
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type'],
// };
// app.use(cors(corsOptions));

// // POST route to handle address data
// app.post('/api/addresses', (req, res) => {
//   const { houseNumber, road, category, latitude, longitude } = req.body;

//   // Validate required fields
//   if (!houseNumber || !road || !category || !latitude || !longitude) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   // Save the address to the database (or another appropriate table)
//   const query = `
//     INSERT INTO addresses (houseNumber, road, category, latitude, longitude)
//     VALUES (?, ?, ?, ?, ?)
//   `;
  
//   connection.query(query, [houseNumber, road, category, latitude, longitude], (err, results) => {
//     if (err) {
//       console.error('Error saving address:', err.message);
//       return res.status(500).json({ message: 'Failed to save address' });
//     }

//     // Send a success response with the inserted ID
//     res.status(200).json({
//       message: 'Address saved successfully',
//       id: results.insertId
//     });
//   });
// });

// // Server listener
// const port = 5000;
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
