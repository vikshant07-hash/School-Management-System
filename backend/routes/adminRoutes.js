const router = require("express").Router();
const ctrl = require("../controllers/adminController");

router.get("/students", ctrl.getStudents);
router.put("/approve/:id", ctrl.approve);
router.put("/correction/:id", ctrl.correction);

module.exports = router;