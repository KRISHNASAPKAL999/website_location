import mysql from 'mysql2';  // Replace with mysql2


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

export default connection;
