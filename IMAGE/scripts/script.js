
const my_canvas = document.getElementById('my_canvas');
const ctx = my_canvas.getContext('2d');
const btn = document.getElementById('btn');
const choose = document.getElementById('animal');

console.log('fetch 시작');





btn.addEventListener('click',()=>{
    canvas(choose.value);
})




const canvas = (choose)=>{
    const response = fetch('/getimgfromdb',{
        method : 'post',
        headers : {
            'content-type':'application/json'
        },
        body: JSON.stringify({
            animal : choose
        })
    }).then((res)=>res.json())
    .then(async (res)=>{
    
        // unsigned int 8바이트 배열
        const binary = new Uint8Array(res['result'][0]['img']['data']);
        const blob = new Blob([binary], {type:'image/jpeg'});
        const kimg = new Image();
    
        kimg.src = URL.createObjectURL(blob);
    
        const imgLoadingDone = await kimg.decode();
    
        ctx.drawImage(kimg, 0, 0);
        
    })
}


// const response = fetch('/getimgfromdb',{
//     method : 'post',
//     headers : {
//         'content-type':'application/json'
//     }
// }).then((res)=>res.json())
// .then(async (res)=>{

//     // unsigned int 8바이트 배열
//     const binary = new Uint8Array(res['result'][0]['img']['data']);
//     const blob = new Blob([binary], {type:'image/jpeg'});
//     const kimg = new Image();

//     kimg.src = URL.createObjectURL(blob);

//     const imgLoadingDone = await kimg.decode();

//     ctx.drawImage(kimg, 0, 0);
    
// })




// ctx.fillStyle = 'blue';
// ctx.fillRect(10,10,490,490);
// ctx.stroekRect(10,10,490,490);



// ctx.beginPath();
// ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
// ctx.moveTo(110, 75);
// ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
// ctx.moveTo(65, 65);
// ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
// ctx.moveTo(95, 65);
// ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
// ctx.stroke();