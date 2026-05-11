
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* STATIC FOLDER */
app.use("/uploads", express.static("uploads"));

/* ROUTES */
const imageRoutes = require("./routes/images");
app.use("/images", imageRoutes);

/* ✅ THIS LINE MUST EXIST */
const notificationRoutes = require("./routes/notifications");
app.use("/notifications", notificationRoutes);


const downloadRoutes = require("./routes/downloads");
app.use("/downloads", downloadRoutes);

const galleryRoutes = require("./routes/galleryRoutes");
app.use("/gallery", galleryRoutes);

// Faculty
const facultyRoutes = require("./routes/facultyRoutes");
app.use("/faculty", facultyRoutes);

// Admin Faculty
const adminRoutes = require("./routes/adminFacultyRoutes");
app.use("/admin/faculty", adminRoutes);

// Contact
app.use("/contact", require("./routes/contactRoutes"));

// Admin Contact
const contactAdminRoutes = require("./routes/contactAdmin");
app.use("/admin/contact", contactAdminRoutes);


const authRoutes = require("./routes/auth");
app.use("/", authRoutes);





const analyticsRoutes = require("./routes/analytics");
app.use("/analytics", analyticsRoutes);



app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));



/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("Server running on port 3000");
});