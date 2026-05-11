const express = require("express");

const router = express.Router();

const db = require("../config/db");

/* =========================
   TRACK VISITOR
========================= */

router.get("/track",(req,res)=>{

  let ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.ip;

  const today =
    new Date()
    .toISOString()
    .slice(0,10);

  /* CHECK ALREADY EXISTS */

  const checkSql =

  `SELECT * FROM visitor_logs
   WHERE ip_address = ?
   AND visit_date = ?`;

  db.query(
    checkSql,
    [ip,today],

    (err,result)=>{

      if(err){

        console.log(err);

        return res.json({
          success:false
        });

      }

      /* INSERT ONLY IF NOT EXISTS */

      if(result.length === 0){

        const insertSql =

        `INSERT INTO visitor_logs
        (ip_address,visit_date)
        VALUES (?,?)`;

        db.query(
          insertSql,
          [ip,today],

          (err)=>{

            if(err){

              console.log(err);

              return res.json({
                success:false
              });

            }

            res.json({
              success:true,
              message:"Visitor Added"
            });

          }
        );

      }

      else{

        res.json({
          success:true,
          message:"Already Counted"
        });

      }

    }

  );

});

/* =========================
   GET STATS
========================= */

router.get("/stats",(req,res)=>{

  const today =
    new Date()
    .toISOString()
    .slice(0,10);

  const todaySql =

  `SELECT COUNT(DISTINCT ip_address)
   AS today
   FROM visitor_logs
   WHERE visit_date = ?`;

  const totalSql =

  `SELECT COUNT(DISTINCT ip_address)
   AS total
   FROM visitor_logs`;

  db.query(
    todaySql,
    [today],

    (err,todayResult)=>{

      if(err){

        console.log(err);

        return res.json({
          today:0,
          total:0
        });

      }

      db.query(
        totalSql,

        (err,totalResult)=>{

          if(err){

            console.log(err);

            return res.json({
              today:0,
              total:0
            });

          }

          res.json({

            today:
              todayResult[0].today,

            total:
              totalResult[0].total

          });

        }

      );

    }

  );

});

/* =========================
   RESET
========================= */

router.delete("/reset",(req,res)=>{

  db.query(
    "TRUNCATE TABLE visitor_logs",

    (err)=>{

      if(err){

        console.log(err);

        return res.json({
          success:false
        });

      }

      res.json({
        success:true
      });

    }

  );

});

module.exports = router;