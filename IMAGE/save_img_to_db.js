const mysql = require('mysql2');
const fs = require('fs'); // file system
const dbconfig = require('./config/dbconfig.json');

// Connetion 하나만 만들기
const connection = mysql.createConnection({
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database : dbconfig.database,
    debug : false
});

// 로컬에서 이미지를 읽어서 ,DB에 저장
const dog = {
    img: fs.readFileSync('./images/dog.jpg'), // 파일 다 읽을때 까지 기다리기
    name : 'dog'
};

const cat = {
    img: fs.readFileSync('./images/cat.jpg'), // 파일 다 읽을때 까지 기다리기
    name : 'Cat'
};


const query = connection.query('insert into animals set ?', cat, 
    (err, result)=>{
        if(err){
            console.dir(err);
            return;
        }
        console.log('이미지 db 추가 성공');
        // console.log(query.sql);
        console.dir(result);
})

connection.end();


