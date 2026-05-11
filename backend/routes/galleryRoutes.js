const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controllers/galleryController");

/* MULTER */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* ROUTES */
router.post("/add", upload.single("image"), controller.addImage);

router.get("/", controller.getImages);

router.delete("/:id", controller.deleteImage);

module.exports = router;