const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const url = "mongodb://localhost:27017";
const dbName = "mythri_school";
let db;

MongoClient.connect(url)
    .then(client => {
        console.log("Connected to Database");
        db = client.db(dbName);
    })
    .catch(err => console.error(err));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mythrisuryapet@gmail.com", // Replace with your school email
        pass: "ntlrmdcapfhquqrm" // Replace with the generated App Password
    }
});

// Handle form submission
app.post("/submit", (req, res) => {
    const { parentFirstName, parentLastName, studentName, email, phone, grade, description } = req.body;

    if (!parentFirstName || !parentLastName || !studentName || !email || !phone || !grade) {
        return res.status(400).send("All required fields must be filled!");
    }

    // Save data to MongoDB
    db.collection("admissions")
        .insertOne({
            parentFirstName,
            parentLastName,
            studentName,
            email,
            phone,
            grade,
            description: description || "No additional information provided",
            submitted_at: new Date()
        })
        .then(result => {
            // Send Confirmation Email
            const mailOptions = {
                from: "mythrisuryapet@gmail.com", // Sender address
                to: email, // Recipient address
                subject: "Thank You for Your Submission - Mythri Global School",
                html: `
                    <h1>Thank You for Your Submission!</h1>
                    <p>Dear ${parentFirstName} ${parentLastName},</p>
                    <p>We have received your application for <b>${studentName}</b> in grade <b>${grade}</b>.</p>
                    <p>Our team will review the details and contact you shortly.</p>
                    <p>Here is a summary of your submission:</p>
                    <ul>
                        <li><b>Parent Name:</b> ${parentFirstName} ${parentLastName}</li>
                        <li><b>Student Name:</b> ${studentName}</li>
                        <li><b>Email:</b> ${email}</li>
                        <li><b>Phone:</b> ${phone}</li>
                        <li><b>Grade:</b> ${grade}</li>
                        <li><b>Additional Information:</b> ${description || "N/A"}</li>
                    </ul>
                    <p>Thank you,<br>Mythri Global School Team</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err);
                    return res.status(500).send("Error sending confirmation email.");
                }
                console.log("Email sent:", info.response);
                res.redirect("/confirmation.html");
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error saving data.");
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
