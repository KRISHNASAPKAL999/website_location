// Add a new address
router.post('/', (req, res) => {
  const { houseNumber, road, category, latitude, longitude } = req.body;

  const query = 'INSERT INTO addresses (houseNumber, road, category, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [houseNumber, road, category, latitude, longitude], (err, result) => {
    if (err) {
      console.error('Error saving address:', err);
      return res.status(500).json({ error: 'Error saving address' });
    }

    // After insertion, fetch the inserted data (using `result.insertId` to retrieve the last inserted ID)
    const getQuery = 'SELECT * FROM addresses WHERE id = ?'; // assuming `id` is the primary key
    connection.query(getQuery, [result.insertId], (err, rows) => {
      if (err) {
        console.error('Error retrieving address:', err);
        return res.status(500).json({ error: 'Error retrieving address' });
      }

      // Return the saved address with the response
      res.status(201).json({ message: 'Address saved successfully', address: rows[0] });
    });
  });
});


// // routes/addressRoutes.js
// import express from 'express';
// import connection from '../config/db.js';  // Modify the path as needed

// const router = express.Router();

// // Add a new address (POST)
// router.post('/', (req, res) => {
//   const { houseNumber, road, category, latitude, longitude } = req.body;

//   const query = 'INSERT INTO addresses (houseNumber, road, category, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
//   connection.query(query, [houseNumber, road, category, latitude, longitude], (err, result) => {
//     if (err) {
//       console.error('Error saving address:', err);
//       return res.status(500).json({ error: 'Error saving address' });
//     }
//     res.status(201).json({ message: 'Address saved successfully', address: { houseNumber, road, category, latitude, longitude } });
//   });
// });

// export default router;
