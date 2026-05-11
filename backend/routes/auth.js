const express = require("express");
const router = express.Router();

const db = require("../config/db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "magicalmathsquiz@gmail.com",
    pass: "vujqnplesxdcwivz"
  },
  tls: {
    rejectUnauthorized: false
  }
});

/* ================= OTP ================= */

function generateOTP() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "0123456789";

  let otp = "";

  for (let i = 0; i < 2; i++) {
    otp += letters[Math.floor(Math.random() * letters.length)];
  }

  for (let i = 0; i < 4; i++) {
    otp += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return otp;
}

/* ================= LOGIN OTP ================= */

router.post("/send-otp", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "All Fields Required" });
  }

  db.query(
    "SELECT * FROM admins WHERE username=?",
    [username],
    async (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: "Database Error" });
      }

      if (!results || results.length === 0) {
        return res.json({ success: false, message: "Invalid Username" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ success: false, message: "Wrong Password" });
      }

      const otp = generateOTP();
      const expiry = Date.now() + 5 * 60 * 1000;

      db.query(
        "UPDATE admins SET otp=?, otp_expiry=? WHERE id=?",
        [otp, expiry, user.id]
      );

      try {
        await transporter.sendMail({
          from: "magicalmathsquiz@gmail.com",
          to: user.email,
          subject: "School Admin Login OTP",
          html: `
            <div style="font-family:Arial;padding:20px;background:#f5f5f5;border-radius:10px">

              <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3976/3976625.png" width="80"/>
              </div>

              <h2 style="color:#132B61;text-align:center;">
                SCHOOL ADMIN LOGIN OTP
              </h2>

              <h1 style="color:#40279C;text-align:center;">
                ${otp}
              </h1>

              <p style="text-align:center;font-weight:bold;">
                OTP VALID FOR 5 MINUTES
              </p>

              <p style="text-align:center;color:#d1005d;">
                PLEASE DO NOT SHARE ANYONE
              </p>

              <p style="text-align:center;color:#8B005D;">
                GOVT. SR. SEC. SCHOOL, SHILLA
              </p>

            </div>
          `
        });

        return res.json({ success: true, message: "OTP Sent Successfully on your regestred E-mail Id" });

      } catch (mailErr) {
        console.log(mailErr);
        return res.json({ success: false, message: "Email Failed" });
      }
    }
  );
});

/* ================= LOGIN ================= */

router.post("/login", (req, res) => {
  const { username, password, otp } = req.body;

  if (!username || !password || !otp) {
    return res.json({ success: false, message: "All Fields Required" });
  }

  db.query(
    "SELECT * FROM admins WHERE username=?",
    [username],
    async (err, results) => {
      if (err) {
        return res.json({ success: false, message: "Database Error" });
      }

      if (!results || results.length === 0) {
        return res.json({ success: false, message: "Invalid Username" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ success: false, message: "Wrong Password" });
      }

      if (!user.otp || user.otp !== otp) {
        return res.json({ success: false, message: "Invalid OTP" });
      }

      if (Date.now() > user.otp_expiry) {
        return res.json({ success: false, message: "OTP Expired" });
      }

      db.query(
        "UPDATE admins SET otp=NULL, otp_expiry=NULL WHERE id=?",
        [user.id]
      );

      return res.json({ success: true, message: "Login Successful" });
    }
  );
});

/* ================= RESET OTP ================= */

router.post("/send-reset-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email Required" });
  }

  db.query(
    "SELECT * FROM admins WHERE email=?",
    [email],
    async (err, results) => {
      if (err) {
        return res.json({ success: false, message: "Database Error" });
      }

      if (!results || results.length === 0) {
        return res.json({ success: false, message: "Email Not Found" });
      }

      const user = results[0];

      const otp = generateOTP();
      const expiry = Date.now() + 5 * 60 * 1000;

      db.query(
        "UPDATE admins SET otp=?, otp_expiry=? WHERE id=?",
        [otp, expiry, user.id]
      );

      try {
        await transporter.sendMail({
          from: "magicalmathsquiz@gmail.com",
          to: user.email,
          subject: "Reset OTP",
          html: `
            <div style="font-family:Arial;padding:20px;background:#f5f5f5;border-radius:10px">

              <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3976/3976625.png" width="80"/>
              </div>

              <h2 style="color:#132B61;text-align:center;">
                RESET PASSWORD OTP is:
              </h2>

              <h1 style="color:#40279C;text-align:center;">
                ${otp}
              </h1>

              <p style="text-align:center;font-weight:bold;">
                OTP VALID FOR 5 MINUTES
              </p>

              <p style="text-align:center;color:#d1005d;">
                PLEASE DO NOT SHARE ANYONE
              </p>

              <p style="text-align:center;color:#8B005D;">
                GOVT. SR. SEC. SCHOOL, SHILLA
              </p>

            </div>
          `
        });

        return res.json({ success: true, message: "OTP Sent" });

      } catch (e) {
        return res.json({ success: false, message: "Email Failed" });
      }
    }
  );
});

/* ================= RESET PASSWORD ================= */

router.post("/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;

  db.query(
    "SELECT * FROM admins WHERE email=?",
    [email],
    async (err, results) => {
      if (err) {
        return res.json({ success: false, message: "Database Error" });
      }

      if (!results || results.length === 0) {
        return res.json({ success: false, message: "User Not Found" });
      }

      const user = results[0];

      if (!user.otp || user.otp !== otp) {
        return res.json({ success: false, message: "Invalid OTP" });
      }

      if (Date.now() > user.otp_expiry) {
        return res.json({ success: false, message: "OTP Expired" });
      }

      const hash = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE admins SET password=?, otp=NULL, otp_expiry=NULL WHERE id=?",
        [hash, user.id]
      );

      return res.json({ success: true, message: "Password Changed" });
    }
  );
});

module.exports = router;