let mediaRecorder;
let audioChunks = [];

let total = 0;
let wakeCount = 0;
let nonWakeCount = 0;


const status = document.getElementById("status");
const result = document.getElementById("result");


document.getElementById("start").onclick = async()=>{

    const stream = await navigator.mediaDevices.getUserMedia({
        audio:true
    });


    mediaRecorder = new MediaRecorder(stream);


    audioChunks=[];


    mediaRecorder.ondataavailable = e=>{
        audioChunks.push(e.data);
    };


    mediaRecorder.onstop = async()=>{


        const blob = new Blob(
            audioChunks,
            {type:"audio/wav"}
        );


        let form = new FormData();

        form.append(
            "audio",
            blob,
            "record.wav"
        );


        result.innerHTML="Processing...";


        const response = await fetch(
            "http://127.0.0.1:8000/detect",
            {
                method:"POST",
                body:form
            }
        );


        const data = await response.json();


        console.log(data);


        total++;

        document.getElementById("total").innerHTML=total;


        if(data.wake){

            result.innerHTML="WAKE WORD";

            wakeCount++;

            document.getElementById("wakeCount").innerHTML=wakeCount;

        }else{

            result.innerHTML="NON WAKE";

            nonWakeCount++;

            document.getElementById("nonwakeCount").innerHTML=nonWakeCount;
        }


    };


    mediaRecorder.start();


    status.innerHTML="🎙 Microphone Recording";

};



document.getElementById("stop").onclick=()=>{

    if(mediaRecorder){

        mediaRecorder.stop();

        status.innerHTML="Microphone Idle";

    }

};
