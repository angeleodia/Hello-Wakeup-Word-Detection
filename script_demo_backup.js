let stream;
let mediaRecorder;
let chunks = [];
let running = false;

let total = 0;
let wakeCount = 0;
let nonWakeCount = 0;


const status = document.getElementById("status");
const result = document.getElementById("result");

const wakeScore = document.getElementById("wakeScore");
const nonwakeScore = document.getElementById("nonwakeScore");


const totalText = document.getElementById("total");
const wakeText = document.getElementById("wakeCount");
const nonwakeText = document.getElementById("nonwakeCount");

const history = document.getElementById("history");



document.getElementById("start").onclick = async()=>{


if(running) return;


stream = await navigator.mediaDevices.getUserMedia({
    audio:true
});


running=true;


status.innerHTML="🎙 Microphone Listening";
status.className="status listening";


listenLoop();


};



async function listenLoop(){


while(running){


await recordAudio();


await new Promise(
resolve=>setTimeout(resolve,100)
);


}


}





function recordAudio(){

return new Promise(resolve=>{

chunks=[];


mediaRecorder = new MediaRecorder(stream);


mediaRecorder.ondataavailable = e=>{

    if(e.data.size > 0){
        chunks.push(e.data);
    }

};



mediaRecorder.onstop = async()=>{


const blob = new Blob(
    chunks,
    {
        type:"audio/wav"
    }
);


console.log("AUDIO SIZE:", blob.size);


await sendAudio(blob);


resolve();


};



mediaRecorder.start();



setTimeout(()=>{

    if(mediaRecorder.state === "recording"){
        mediaRecorder.stop();
    }

},1500);



});


}




async function sendAudio(blob){

console.log("AUDIO SIZE:", blob.size);

let form=new FormData();


form.append(
"audio",
blob,
"record.wav"
);



try{


let response=await fetch(

"http://127.0.0.1:8000/detect",

{

method:"POST",

body:form

}

);



let data=await response.json();



console.log(data);

updateUI(data);   
result.innerHTML = data.prediction.toUpperCase();


if(total % 5 === 0){
analyzeAudio(blob);

}


}

catch(error){

console.log(error);

}



}




function updateUI(data){


result.innerHTML =
data.prediction;



wakeScore.innerHTML =
data.wake_score ?? "-";



nonwakeScore.innerHTML =
data.nonwake_score ?? "-";



total++;

totalText.innerHTML=total;



if(data.wake){

wakeCount++;

wakeText.innerHTML=wakeCount;


}else{

nonWakeCount++;

nonwakeText.innerHTML=nonWakeCount;

}




let row=document.createElement("tr");


row.innerHTML=`

<td>${new Date().toLocaleTimeString()}</td>

<td>${data.prediction}</td>

`;

history.prepend(row);



}





document.getElementById("stop").onclick=()=>{


running=false;



if(stream){

stream.getTracks().forEach(
track=>track.stop()
);

}



status.innerHTML="● Microphone Idle";

status.className="status idle";

};

async function analyzeAudio(blob){

let form = new FormData();

form.append(
    "audio",
    blob,
    "record.wav"
);


try{

let response = await fetch(
"http://127.0.0.1:8000/analyze",
{
method:"POST",
body:form
}
);


let data = await response.json();


console.log("ANALYSIS:",data);


drawWaveform(data.waveform);

drawMFCC(data.mfcc);

drawSpectrogram(data.spectrogram);


document.getElementById("phoneme").innerHTML =
"Feature extraction complete";


}

catch(err){

console.log("ANALYZE ERROR",err);

}

}





function drawWaveform(data){

let canvas=document.getElementById(
"waveCanvas"
);

let ctx=canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);


ctx.beginPath();


data.forEach((v,i)=>{

let x=i/data.length*canvas.width;

let y=
canvas.height/2 -
v*canvas.height;


if(i===0)
ctx.moveTo(x,y);
else
ctx.lineTo(x,y);


});


ctx.stroke();

}





function drawMFCC(data){

let canvas=document.getElementById(
"mfccCanvas"
);

let ctx=canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);


let h=data.length;

let w=data[0].length;


for(let y=0;y<h;y++){

for(let x=0;x<w;x++){


let value=data[y][x];


let color =
Math.floor(
(value + 40) * 5
);

color = Math.max(
0,
Math.min(
255,
color
)
);


ctx.fillStyle=
`rgb(${color},${color},${color})`;


ctx.fillRect(
x * canvas.width / w,
    y * canvas.height / h,
    canvas.width / w + 1,
    canvas.height / h + 1
);

}

}


}


function drawSpectrogram(data){

let canvas=document.getElementById(
"spectrogramCanvas"
);

let ctx=canvas.getContext("2d");


canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;


ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);


let height=data.length;
let width=data[0].length;


let max=-Infinity;
let min=Infinity;


for(let y=0;y<height;y++){

    for(let x=0;x<width;x++){

        let v=data[y][x];

        if(v>max) max=v;
        if(v<min) min=v;

    }

}



for(let y=0;y<height;y++){

    for(let x=0;x<width;x++){


        (data[y][x]-min) /
(max-min);let value =
        (data[y][x]-min) /
        (max-min);

	value = Math.pow(value, 0.5);

        let c =
        Math.floor(value*255);


        ctx.fillStyle =
        `rgb(${c*2},${c},${255-c})`;

        ctx.fillRect(

            x * canvas.width / width,

            canvas.height -
            (y * canvas.height / height),

            canvas.width / width + 1,

            canvas.height / height + 1

        );


    }

}

}
