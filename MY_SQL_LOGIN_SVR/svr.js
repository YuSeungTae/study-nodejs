`use strict`
const { exec } = require('child_process');
const express = require('express');
const mysql = require('mysql2'); // npm install mysql
const path = require('path'); // 경로명을 쉽게 만들어주는 package
const static = require('serve-static'); // 이 프로그램을 돌릴때만 이 디렉토리를 루트로 설정

const dbconfig = require('./config/dbconfig.json');
// mySQL과 node 사이의 connection pool을 만듦.
// 정보들은 보안상의 이유로 config 디렉토리에 따로 저장
const pool = mysql.createPool({ 
    connectionLimit: 10,         // pool의 conection의 개수
    host: dbconfig.host,          // DB의 ip
    user: dbconfig.user,          // DB의 username
    password: dbconfig.password,  // DB의 password
    database: dbconfig.database,  // 어떤 DB를 Access할건지
    debug:false
});

const app = express();
app.use(express.urlencoded({extended:true})); // 확장된 URL인코디드 방법을 지원을 한다.
app.use(express.json()); // JSON으로 와도 볼수 있다.
app.use('/public',static(path.join(__dirname, 'public'))); // pubilc에대한 요청에서 현재 디렉토리에 있는 pubilc 디렉토리를 루트 디렉토리로 한다.



//로그인
app.post('/process/login',(req,res)=>{
    console.log('/process/login 호출됨'+req);
    const parmID = req.body.id;
    const pramPassword = req.body.password;

    console.log('로그인 요청'+parmID+' '+pramPassword);

    pool.getConnection((err, conn)=>{
        if(err){
            pool.releaseConnection(conn);

            console.log('MySQL getconnection error, aborted');
            res.writeHead('200',{'Content-Type':'text/html; charest=utf8'});
            res.write('<h1>DB 서버 연결 실패</h1>');
            res.end();
            return;
        }

        const exec = conn.query('select `id`,`name` from `users` where `id` = ? and `password` = ?;',
            [parmID, pramPassword],
            (err,rows) => { // rows안에 들어있는 정보 : id, name
                pool.releaseConnection(conn);
                console.log('실행된 SQL query: '+exec.sql);
                if(err){
                    console.dir(err);
                    res.writeHead('200',{'Content-Type':'text/html; charest=utf8'});
                    res.write('<h1>SQL query 실행 실패</h1>');
                    res.end();
                    return;
                }

                if(rows.length>0){
                    console.log(`아이디 ${parmID}, 패스워드가 일치하는 사용자 ${rows[0].name} 찾음`);
                    res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
                    res.write('<h2>로그인 성공</h2>');
                    res.end();
                    return;
                }
                else{
                    console.log(`아이디 ${parmID}, 패스워드 일치 없음`);
                    res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
                    res.write('<h2>로그인 실패. 아이디와 패스워드를 확인하세요.</h2>');
                    res.end();
                }


            }

        )


    });




});

//회원가입
app.post('/process/adduser', (req,res)=>{
    console.log('/process/adduser 호출됨'+req);
    const parmID = req.body.id;
    const pramName = req.body.name;
    const parmAge = req.body.age;
    const pramPassword = req.body.password;
    

    pool.getConnection((err, conn)=>{  // 놀고있는 커넥션 하나 줘

        console.log(parmID+pramName+parmAge+pramPassword);
        if(err){
            pool.releaseConnection(conn);

            console.log('MySQL getconnection error, aborted');
            res.writeHead('200',{'Content-Type':'text/html; charest=utf8'});
            res.write('<h1>DB 서버 연결 실패</h1>');
            res.end();
            return;
        }
    
        console.log('연결 끈 얻었음....');
        console.log(dbconfig.host+dbconfig.user+dbconfig.password+dbconfig.database)

        
        const exec = conn.query('insert into users(id,name,age,password) values (?,?,?,?);',
                                [parmID, pramName, parmAge, pramPassword],
                                (err,result)=>{   // 쿼리 실행 후
                                    pool.releaseConnection(conn);

                                    console.log('실행된 SQL: '+ exec.sql);

                                    if(err){
                                        console.log('SQL 실행 시 오류 발생');
                                        console.dir(err);
                                        res.writeHead('200',{'Content-Type':'text/html; charest=utf8'});
                                        res.write('<h1>SQL query 실행 실패</h1>');
                                        res.end();
                                        return;
                                    }

                                    if(result){
                                        console.log('Inserted 성공');
                                        console.dir(result);

                                        res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
                                        res.write('<h2>사용자 추가 성공</h2>');
                                        res.end();

                                    }
                                    else{
                                        console.log('Inserted 실패');

                                        res.writeHead('200',{'Content-Type':'text/html; charest=utf8'});
                                        res.write('<h1>사용자 추가 실패</h1>');
                                        res.end();
                                    }

                                }
        )
    })

});



app.listen(3000,()=>{
    console.log('Listening on port 3000');
})