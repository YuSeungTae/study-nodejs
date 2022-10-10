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

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/public',static(path.join(__dirname,'/public')));



app.post('/saveBbox',(req,res)=>{

    console.log('saveBbox 호출됨');
    const imgname = req.body.imgname;
    const coordstxt = req.body.coords;
    console.log(`asd: ${req.body.imgname}`);
    
    console.log(`imgname is ${imgname}`);
    console.log(`coords is ${coordstxt}`);

    const reply ={
        'status':'notok'
    }

    pool.getConnection((err,conn)=>{

        // conn을 얻지못할 경우인 에러 처리
        if(err){
            // conn.release();
            pool.releaseConnection(conn);
            console.log('pool.getConnection 에러 발생');
            console.dir(err);
            reply['status'] = 'notok db pool error'
            res.json(reply);
            return;
        }
        
        const query_str = 'update `animals2` set `coords`=? where `name`=?';

        conn.query(query_str,[coordstxt,imgname],(error, rows, fields)=>{
            if(error){
                // conn.release();
                pool.releaseConnection(conn);
                console.dir(error);
                reply.status = 'notok query error';
                res.json(reply);
                return;
            }

            pool.releaseConnection(conn);
            reply['status'] = 'ok';
            res.json(reply);
            console.log(`Coords 저장 성공. 대상 이미지: ${imgname}`);



        } )




    })

})


app.post('/getimgfromdbbyname',(req,res)=>{
    
    console.log('getimgfromdbbynname 호출됨');
    const imgname = req.body.imgname;
    console.log(`img name == ${imgname}`);

    // WB에 보낼 reply
    const reply ={
        'status' :'notok'
    }

    pool.getConnection((err,conn)=>{

        // conn을 얻지못할 경우인 에러 처리
        if(err){
            // conn.release();
            pool.releaseConnection(conn);
            console.log('pool.getConnection 에러 발생');
            console.dir(err);
            reply['status'] = 'notok db pool error'
            res.json(reply);
            return;
        }
        
        const query_str = 'select `img` from `animals2` where `name` = ?';

        conn.query(query_str,[imgname],(error, rows, fields)=>{
            if(error){
                // conn.release();
                pool.releaseConnection(conn);
                console.dir(error);
                reply.status = 'notok query error';
                res.json(reply);
                return;
            }

            pool.releaseConnection(conn);


            if(rows.length > 0){
                reply.status= 'ok';
                reply['rows'] = rows;
                console.log('이미지 전달 성공');
            }
            else{
                reply.status = 'notok, no result';
                console.log('매칭되는 사진 X');
            }

            res.json(reply);

        } )



    })

})


app.listen(3000, ()=>{
    console.log('Server started at 3000')
})
