const router = require("express").Router();
const ctrl = require("../controllers/studentController");

router.post("/add", ctrl.addStudent);
router.get("/:email", ctrl.getStudent);
router.put("/update/:id", ctrl.updateStudent);
router.get("/by-token/:token", ctrl.getByToken);
router.put("/update-by-token/:token", ctrl.updateByToken);

module.exports = router;