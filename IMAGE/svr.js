// const express = require('express');
// const mysql = require('mysql2');
// const path = require('path');
// const static = require('serve-static');
// const dbconfig = require('./config/dbconfig.json');

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');

const pool = mysql.createPool({
    connectionLimit: dbconfig.connectionLimit,
    host: dbconfig.host,
    user : dbconfig.user,
    database: dbconfig.database,
    password : dbconfig.password,
    debug : false
});

// const app = express();

// app.use(express.urlencoded({extended:true}));
// app.use(express.json());
// app.use('/public', static(path.join(__dirname,'public')));

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/public',static(path.join(__dirname,'/public')));

// WB에서 요청되는 이미지를 DB에서 추출해서 제공하는 부분

app.use('/scripts', express.static(__dirname+'/scripts'));

app.post('/getimgfromdb',(req, res)=>{
    console.log('getimgfromdb 호출됨');
    const animal = req.body.animal;
    console.log(animal);
    pool.getConnection((err,conn)=>{

        
        // const query_str = 'select * from animals where rid = 2;'

        conn.query('select * from animals where rid = ?;'
        ,[animal], (error, rows, fields)=>{ // error, row , columm 

            if(error){
                pool.releaseConnection(conn);
                console.dir(error);
                res.status(401).json('Query failed');
                return;
            }

            const reply = {
                'result' : rows
            }

            res.status(200).json(reply);
            pool.releaseConnection(conn);
        })
    })

})



app.listen(3000,()=>{
    console.log('Starting to listen');
})
