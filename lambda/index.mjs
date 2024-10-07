import mysql from 'mysql2/promise';

export const handler = async (event) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Database connection successful');

    // Begin transaction
    await connection.beginTransaction();

    // Move old, paid bills to archive
    const [archiveResult] = await connection.execute(`
      INSERT INTO ArchivedBill (original_bill_id, bill_type, amount, due_date, paid_date, user_id, property_id)
      SELECT bill_id, bill_type, amount, due_date, paid_date, user_id, property_id
      FROM Bill
      WHERE paid = TRUE AND paid_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `);

    console.log(`Archived ${archiveResult.affectedRows} bills`);

    // Delete the archived bills from the main table
    const [deleteResult] = await connection.execute(`
      DELETE FROM Bill
      WHERE paid = TRUE AND paid_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `);

    console.log(`Deleted ${deleteResult.affectedRows} old bills`);

    // Commit the transaction
    await connection.commit();

    return {
      statusCode: 200,
      body: JSON.stringify(`Archived and deleted ${deleteResult.affectedRows} old bills`)
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error during database cleanup')
    };
  } finally {
    if (connection) await connection.end();
  }
};