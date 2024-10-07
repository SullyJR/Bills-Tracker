import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

// Create transporter using Outlook SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587, // Use 587 for TLS
  secure: false, // false for STARTTLS (recommended for Outlook)
  auth: {
    user: 'COSC349.FlatBills@outlook.com', // your Outlook email
    pass: 'Password2024' // your Outlook password
  }
});

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

    const [results] = await connection.execute(
      'SELECT * FROM Bill WHERE due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)'
    );

    console.log('Upcoming bills:', JSON.stringify(results));

    if (results.length > 0) {
      const emailContent = results.map(bill =>
        `Bill: ${bill.description}, Amount: $${bill.amount}, Due: ${bill.due_date}`
      ).join('\n');

      await transporter.sendMail({
        from: 'COSC349.FlatBills@outlook.com',
        to: 'callumsu2003@gmail.com', // Replace with actual tenant email
        subject: 'Upcoming Bill Reminders',
        text: `You have the following bills due soon:\n\n${emailContent}`
      });

      console.log('Reminder email sent successfully');
    } else {
      console.log('No upcoming bills found');
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify(`Processed ${results.length} upcoming bills`) 
    };
  } catch (error) {
    console.error('Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify('Error processing bills') 
    };
  } finally {
    if (connection) await connection.end();
  }
};