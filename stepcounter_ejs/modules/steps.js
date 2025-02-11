const express = require('express');
const db = require('./database');
const router = express.Router();
const uuid = require('uuid');



// Route to handle saving steps data
router.post('/add', (req, res) => {
    let { date, count } = req.body;

    if (!date || !count) {
        req.session.msg = 'Please provide both date and step count!';
        req.session.severity = 'danger';
        res.redirect('/newdata');
        return;
    }

    let userID = req.session.userID; 

    db.query(`SELECT * FROM stepdatas WHERE userID=? AND date=?`, [userID, date], (err, results)=>{
        if (err) {
            req.session.msg = 'Database error!';
            req.session.severity = 'danger';
            res.redirect('/newdata');
            return;
        }
        if (results.length > 0) {
            db.query(`UPDATE stepdatas SET count = count + ? WHERE ID=?`,[count, results[0].ID], (err, results)=>{
                if (err) {
                    req.session.msg = 'Database error!';
                    req.session.severity = 'danger';
                    res.redirect('/newdata');
                    return;
                }
                req.session.msg = 'Stepdata updated successfully!';
                req.session.severity = 'success';
                res.redirect('/newdata');
            })
        }
        else
        {
            db.query(
                `INSERT INTO stepdatas (ID ,userID, date, count) VALUES (?, ?, ?, ?)`,
                [uuid.v4(), userID, date, count],
                (err, results) => {
                    if (err) {
                        req.session.msg = 'Database error!';
                        req.session.severity = 'danger';
                        res.redirect('/newdata');
                        return;
                    }
        
                    req.session.msg = 'Step data saved successfully!';
                    req.session.severity = 'success';
                    res.redirect('/newdata');
                }
            );
        }


    })


});


module.exports = router;
