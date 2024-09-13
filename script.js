let firstClickTime = null;
let secondClickTime = null;
let timeStamps = [];
let bpmRecords = [];

// 初期化時に時刻を常に表示する
updateTime();
setInterval(updateTime, 1000); // 毎秒時刻を更新

// ボタンが押された際の処理
document.getElementById('pulseButton').addEventListener('click', function() {
    const now = new Date();
    const formattedTime = formatDate(now);
    
    if (firstClickTime === null) {
        firstClickTime = now;
    } else {
        secondClickTime = now;
        const bpm = calculateBPM();
        
        // タイムスタンプと心拍数を保存
        timeStamps.push(formattedTime);
        bpmRecords.push({ timestamp: formattedTime, bpm: bpm });

        localStorage.setItem('timeStamps', JSON.stringify(timeStamps));
        localStorage.setItem('bpmRecords', JSON.stringify(bpmRecords));

        firstClickTime = null; // Reset after calculation
    }
});

// BPMを計算する関数
function calculateBPM() {
    const timeDifference = (secondClickTime - firstClickTime) / 1000; // Difference in seconds
    const bpm = (60 / timeDifference).toFixed(2);
    document.getElementById('bpmValue').textContent = bpm;
    return bpm;
}

// 現在時刻を表示する関数
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = timeString;
}

// 日付を yyyy-MM-dd hh:mm:ss.SSS 形式にフォーマットする関数
function formatDate(date) {
    const yyyy = date.getFullYear();
    const MM = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const hh = ('0' + date.getHours()).slice(-2);
    const mm = ('0' + date.getMinutes()).slice(-2);
    const ss = ('0' + date.getSeconds()).slice(-2);
    const SSS = ('00' + date.getMilliseconds()).slice(-3); // ミリ秒の追加
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}.${SSS}`;
}

// 日付を yyyy-MM-dd-hh-mm-ss 形式にフォーマットしてファイル名に使用する関数
function formatFileName(date) {
    const yyyy = date.getFullYear();
    const MM = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const hh = ('0' + date.getHours()).slice(-2);
    const mm = ('0' + date.getMinutes()).slice(-2);
    const ss = ('0' + date.getSeconds()).slice(-2);
    return `${yyyy}-${MM}-${dd}-${hh}-${mm}-${ss}`;
}

// ハンバーガーメニューのトグル処理
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // ダウンロード属性を設定
    document.body.appendChild(link);
    link.click(); // ダウンロードを実行
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // メモリ解放
}

// CSVダウンロード処理（時刻）
document.getElementById('downloadTimestamps').addEventListener('click', function() {
    const storedTimeStamps = JSON.parse(localStorage.getItem('timeStamps')) || [];
    let csvContent = 'TimeStamp\n';

    storedTimeStamps.forEach(function(timeStamp) {
        csvContent += timeStamp + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const now = new Date();
    const fileName = `timestamp_${formatFileName(now)}.csv`; // ファイル名に現在の時刻を追加

    downloadFile(csvContent, fileName);
    // link.setAttribute('href', encodedUri);
    // link.setAttribute('download', fileName);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
});

// CSVダウンロード処理（心拍）
document.getElementById('downloadBpm').addEventListener('click', function() {
    const storedBpmRecords = JSON.parse(localStorage.getItem('bpmRecords')) || [];
    let csvContent = 'TimeStamp,BPM\n';

    storedBpmRecords.forEach(function(record) {
        csvContent += `${record.timestamp},${record.bpm}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const now = new Date();
    const fileName = `bpm_${formatFileName(now)}.txt`; // ファイル名に現在の時刻を追加

    downloadFile(csvContent, fileName)

    // link.setAttribute('href', encodedUri);
    // link.setAttribute('download', fileName);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
});

// データ消去機能
document.getElementById('deleteData').addEventListener('click', function() {
    const storedTimeStamps = JSON.parse(localStorage.getItem('timeStamps')) || [];
    
    if (storedTimeStamps.length === 0) {
        alert('保存されているデータがありません。');
        return;
    }

    const firstTimeStamp = storedTimeStamps[0];
    const lastTimeStamp = storedTimeStamps[storedTimeStamps.length - 1];
    const confirmationMessage = `${firstTimeStamp}\n〜\n${lastTimeStamp}\nのデータを消去しますか？`;

    if (confirm(confirmationMessage)) {
        // データ消去
        localStorage.removeItem('timeStamps');
        localStorage.removeItem('bpmRecords');
        timeStamps = [];
        bpmRecords = [];
        alert('データが消去されました。');
    }
});

// モーダルウィンドウの表示と閉じる処理
const modal = document.getElementById('usageModal');
const span = document.getElementsByClassName('close')[0];
const usageText = document.getElementById('usageText');

// 使用方法テキスト
const usageInstructions = `
1. <b>心拍数の計算</b>
 - 画面中央のボタンを脈拍に合わせて2回クリックします。
 - 2回目のクリック後、心拍数（BPM）がボタンの中に表示されます。

2. <b>データのダウンロード</b>
 - タイムスタンプのダウンロード:
  - 画面右上のハンバーガーメニュー（3本線のアイコン）をクリックします。
  - 「ダウンロード（時刻）」を選択すると、ボタンが押されたタイムスタンプをCSV形式でダウンロードできます。
  - ファイル名は \`timestamp_yyyy-MM-dd-hh-mm-ss.csv\` という形式になります。

 - 心拍数データのダウンロード:
  - ハンバーガーメニューをクリックし、「ダウンロード（心拍）」を選択すると、計算された心拍数（BPM）を含むデータをCSV形式でダウンロードできます。
  - ファイル名は \`bpm_yyyy-MM-dd-hh-mm-ss.csv\` という形式になります。

3. <b>データの消去</b>
 - データ消去:
  - ハンバーガーメニューをクリックし、「データ消去」を選択します。
  - 保存されているデータの最初と最後のタイムスタンプを確認するダイアログが表示され、「[先頭の時刻]〜[最後の時刻]のデータを消去しますか？」と確認されます。
  - 確認後、データはブラウザから消去されます。
`;

// モーダルを開く
document.getElementById('usageInfo').addEventListener('click', function() {
    usageText.innerHTML = usageInstructions; // innerHTMLでHTMLを挿入
    modal.style.display = 'block';
});

// モーダルを閉じる
span.onclick = function() {
    modal.style.display = 'none';
};

// モーダル外をクリックしたときに閉じる
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 400) { 
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);