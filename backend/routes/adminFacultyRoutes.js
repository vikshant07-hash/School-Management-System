const router = require("express").Router();
const c = require("../controllers/adminFacultyController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination:"uploads/",
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
  }
});

const upload = multer({storage});

router.post("/add",upload.single("photo"),c.add);
router.put("/update/:id",c.update);
router.delete("/delete/:id",c.remove);

module.exports = router;