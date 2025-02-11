const express = require('express');
const ejs = require('ejs');
const db = require('./database');
const router = express.Router();
const moment = require('moment');

// CORE routes
router.get('/', (req, res) => {
    ejs.renderFile('./views/index.ejs', { session: req.session }, (err, html)=>{
        if (err){
            console.log(err);
            return
        }
        req.session.msg = '';
        res.send(html);
    });
});

router.get('/reg', (req, res) => {
    ejs.renderFile('./views/regist.ejs', { session: req.session }, (err, html)=>{
        if (err){
            console.log(err);
            return
        }
        req.session.msg = '';
        res.send(html);
    });
});

router.get('/newdata', (req, res)=>{
    if (req.session.isLoggedIn){
        let today = moment(new Date()).format('YYYY-MM-DD');
        ejs.renderFile('./views/newdata.ejs', { session: req.session, today }, (err, html)=>{
            if (err){
                console.log(err);
                return
            }
            req.session.msg = '';
            res.send(html);
        });
        return
    }
    res.redirect('/');
});

router.get('/statistics', (req, res)=>{

    const userID = req.session.userID;

    // SQL lekérdezés a lépések adatainak lehívásához
    db.query(
        `SELECT date, count FROM stepdatas WHERE userID = ? ORDER BY date ASC`,
        [userID],
        (err, results) => {
            if (err) {
                req.session.msg = 'Database error!';
                req.session.severity = 'danger';
                res.redirect('/statistics');
                return;
            }

            // Összegzés kiszámítása
            let totalSteps = 0;
            let events = [];
            let labels=  [];
            let datas = [];

            results.forEach(item => {
                item.date = moment(item.date).format('YYYY-MM-DD');
                totalSteps +=item.count

                events.push({
                    title: item.count,
                    start: new Date(item.date),
                    allDay: true

                })
                labels.push(item.date)
                datas.push(item.count)
            });


            if (req.session.isLoggedIn){
                ejs.renderFile('./views/statistics.ejs', { session: req.session, steps: results, totalSteps: totalSteps, events, labels, datas }, (err, html)=>{
                    if (err){
                        console.log(err);
                        return
                    }
                    req.session.msg = '';
                    res.send(html);
                });
                return
            }
            res.redirect('/');
        }
    )


});


router.get('/logout', (req, res)=>{

    req.session.isLoggedIn = false;
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'You are logged out!';
    req.session.severity = 'info';
    res.redirect('/');

});

module.exports = router;