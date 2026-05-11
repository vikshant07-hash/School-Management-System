const db = require("../config/db");
const fs = require("fs");
const path = require("path");

/* ADD IMAGE */
exports.addImage = (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Image required" });
  }

  const title = req.body.title || "Untitled";
  const image = req.file.filename;

  db.query(
    "INSERT INTO gallery (title, image) VALUES (?,?)",
    [title, image],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Image uploaded" });
    }
  );
};

/* GET ALL */
exports.getImages = (req, res) => {
  db.query("SELECT * FROM gallery ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

/* DELETE */
exports.deleteImage = (req, res) => {

  const id = req.params.id;

  db.query("SELECT * FROM gallery WHERE id=?", [id], (err, result) => {

    if (err || result.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const file = result[0].image;

    db.query("DELETE FROM gallery WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      fs.unlink(path.join(__dirname, "../uploads", file), () => {});

      res.json({ message: "Deleted" });
    });

  });

};