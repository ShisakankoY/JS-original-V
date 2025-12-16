const canvas = document.getElementById("vtuberCanvas");
const ctx = canvas.getContext("2d");

//マイク入力・変数のグローバル化
let audioCtx;
let analyser;
let source;
let dataArray;
let voiceVolume = 0;

//中央座標
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

//アバター描画

//口のサイズ調整

//口の縦の長さ
let vertical = 2; 
let newVertical = 0;//スムージング用理想の長さ
function speak() {
    if (voiceVolume > 0 && voiceVolume < 25) {
        newVertical = 0;
    } else if (voiceVolume >= 25 && voiceVolume < 40) {
        newVertical = 5;
    } else if (voiceVolume >= 40 && voiceVolume < 80) {
        newVertical = 10;
    } else if (voiceVolume >= 80 && voiceVolume < 120) {
        newVertical = 20;
    } else if (voiceVolume >= 120 && voiceVolume < 160) {
        newVertical = 30;
    } else if (voiceVolume >= 160 && voiceVolume < 200) {
        newVertical = 40;
    } else if (voiceVolume >= 200 && voiceVolume <= 250) {
        newVertical = 50;
    }

    //スムージング
    vertical = vertical * 0.6 + newVertical * 0.4;
}

//瞬き
let eyeVertical = 20; //目の縦の長さ
setInterval(() => {
    eyeVertical = 2;
    setTimeout(() => {
        eyeVertical = 20;
    }, 100);
}, 6000);

function motion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    speak();

    //顔全体
    const rectSize = 250; //一辺の長さ
    ctx.fillStyle = "#FEDCBD";
    ctx.fillRect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);

    ctx.strokeStyle = "black";
    ctx.strokeRect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);

    //口
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 60, 40, vertical, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#DF7163";
    ctx.fill();
    ctx.stroke();

    //目
    ctx.beginPath();
    ctx.ellipse(150, 210, 30, eyeVertical, 0, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(250, 210, 30, eyeVertical, 0, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();


    //音の数値を毎フレーム呼び出し
    if (analyser && dataArray) { //マイク(非同期)対策
        analyser.getByteFrequencyData(dataArray); //dataArrayに音の数値(0~255)が入る

        //dataArrayの中身
        let total = 0;
        for (let i = 0; i < dataArray.length; i++) {
            total += dataArray[i];
        }
        voiceVolume = total / dataArray.length;
    }

    requestAnimationFrame(motion);
}

motion();

//===============================
//マイク入力

//マイクにアクセス
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
        console.log("マイク使用可能");

        //音の解析準備
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();

        //音をanalyserに接続
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        //音声取得
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    })
    .catch(function (err) {
        console.log("マイクにアクセス不可", err);
    })