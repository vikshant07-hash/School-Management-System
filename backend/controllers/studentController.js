const db = require("../config/db");
const sendMail = require("../utils/mailer");
const crypto = require("crypto");

// =====================
// ADD STUDENT
// =====================
exports.addStudent = (req, res) => {
  const d = req.body;

  const sql = `
    INSERT INTO students
    (name,father_name,mother_name,dob,gender,email,phone,aadhar,class,subjects,address,city,state,pincode,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    d.name || "",
    d.father_name || "",
    d.mother_name || "",
    d.dob || null,
    d.gender || "",
    d.email || "",
    d.phone || "",
    d.aadhar || "",
    d.class || "",
    d.subjects || "",
    d.address || "",
    d.city || "",
    d.state || "",
    d.pincode || "",
    "pending"
  ];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.sqlMessage
      });
    }

    const studentId = result.insertId;

    // =====================
    // TOKEN GENERATION
    // =====================
    const token = crypto.randomBytes(16).toString("hex");

    db.query(
      "UPDATE students SET edit_token=? WHERE id=?",
      [token, studentId]
    );

    // =====================
    // EMAIL
    // =====================
    try {
      await sendMail(
        d.email,
        "Admission Submitted",
        `Hello ${d.name},

Your form is submitted.

Correction link:
http://localhost:3000/correction.html?token=${token}`
      );
    } catch (e) {
      console.log("EMAIL ERROR:", e.message);
    }

    res.json({
      success: true,
      message: "Submitted + Email sent",
      id: studentId
    });
  });
};

// =====================
// GET BY EMAIL
// =====================
exports.getStudent = (req, res) => {
  db.query(
    "SELECT * FROM students WHERE email=?",
    [req.params.email],
    (err, data) => {
      if (err) return res.json(err);

      res.json({
        success: true,
        data: data[0] || null
      });
    }
  );
};

// =====================
// UPDATE AFTER CORRECTION (ID BASED)
// =====================
exports.updateStudent = (req, res) => {
  const id = req.params.id;
  const d = req.body;

  db.query(
    `UPDATE students SET 
    name=?,father_name=?,mother_name=?,dob=?,gender=?,class=?,subjects=?,address=?,city=?,state=?,pincode=?,status='pending',remark=NULL
    WHERE id=?`,
    [
      d.name,
      d.father_name,
      d.mother_name,
      d.dob,
      d.gender,
      d.class,
      d.subjects,
      d.address,
      d.city,
      d.state,
      d.pincode,
      id
    ],
    async (err) => {
      if (err) {
        return res.json({ success: false, message: err.sqlMessage });
      }

      try {
        await sendMail(
          d.email,
          "Form Resubmitted",
          "Your corrected form has been submitted successfully."
        );
      } catch (e) {
        console.log("EMAIL ERROR:", e.message);
      }

      res.json({
        success: true,
        message: "Updated successfully"
      });
    }
  );
};

// =====================
// GET BY TOKEN
// =====================
exports.getByToken = (req, res) => {
  db.query(
    "SELECT * FROM students WHERE edit_token=?",
    [req.params.token],
    (err, data) => {
      if (err) return res.json(err);

      res.json(data[0] || null);
    }
  );
};

// =====================
// UPDATE BY TOKEN
// =====================
exports.updateByToken = (req, res) => {
  const token = req.params.token;
  const d = req.body;

  db.query(
    `UPDATE students SET 
     name=?, father_name=?, dob=?, address=?, status='pending'
     WHERE edit_token=?`,
    [
      d.name,
      d.father_name,
      d.dob,
      d.address,
      token
    ],
    (err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.sqlMessage
        });
      }

      res.json({
        success: true,
        message: "Updated successfully"
      });
    }
  );
};