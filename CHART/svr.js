const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');


const pool= mysql.createPool({
    connectionLimit: dbconfig.connectionLimit,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false,
    timezone: dbconfig.timezone
})

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/public',static(path.join(__dirname,'public')));

app.post('/chartdatafromdb',(req,res)=>{
    console.log('chartdatafromdb 호출됨')

    pool.getConnection((err,conn)=>{

        const resData = {};
        resData.result='error';
        resData.temp = [];
        resData.reg_date = [];
        

        if(err){
            pool.releaseConnection(conn);
            console.log('Mysql getConnection error. aborted');
            res.json(resData);
            return;
        }

        //db에 데이터를 요청한다
        const exec = conn.query('select `temperature`,`reg_date` from `building_temperature` order by `reg_date` asc;',
        (err,rows)=>{

            if(err){
                pool.releaseConnection(conn);
                console.log('Mysql query error. aborted');
                res.json(resData);
                return;
            }

            if(rows[0]){
                resData.result='ok';
                rows.forEach((val)=>{
                    resData.temp.push(val.temperature);
                    resData.reg_date.push(val.reg_date);
                })
            }
            else{
                //query는 성공, 그러나 데이터는 없는 경우
                resData.result = 'none';
            }


            return res.json(resData);
        })

    })
})

//building id가 주어진 경우를 처리
app.post('/chartdatafromdbwithbid',(req,res)=>{
    console.log('chartdatafromdbwithbid 호출됨')

    const bid= req.body.bid;
    console.log('bid is %s',bid);

    pool.getConnection((err,conn)=>{

        const resData = {};
        resData.result='error';
        resData.temp = [];
        resData.reg_date = [];
        

        if(err){
            pool.releaseConnection(conn);
            console.log('Mysql getConnection error. aborted');
            res.json(resData);
            return;
        }

        //db에 데이터를 요청한다
        const exec = conn.query('select `temperature`,`reg_date` from `building_temperature` where `building_id`= ? order by `reg_date` asc;',
        [bid],
        (err,rows)=>{

            if(err){
                pool.releaseConnection(conn);
                console.log('Mysql query error. aborted');
                res.json(resData);
                return;
            }

            if(rows[0]){
                resData.result='ok';
                rows.forEach((val)=>{
                    resData.temp.push(val.temperature);
                    resData.reg_date.push(val.reg_date);
                })
            }
            else{
                //query는 성공, 그러나 데이터는 없는 경우
                resData.result = 'none';
            }


            return res.json(resData);
        })

    })
})




app.listen(3000,()=>{
    console.log("Server started at 3000");
})

