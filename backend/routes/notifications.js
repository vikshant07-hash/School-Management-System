const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");

/* PDF Upload */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ADD NOTIFICATION */
router.post("/add", upload.single("pdf"), (req, res) => {
  const { title, message } = req.body;
  const pdf = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO notifications (title, message, pdf) VALUES (?,?,?)",
    [title, message, pdf],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Notification Added" });
    }
  );
});

/* GET ALL */
router.get("/", (req, res) => {
  db.query("SELECT * FROM notifications ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* DELETE */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM notifications WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});


router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM notifications ORDER BY id DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});
module.exports = router;