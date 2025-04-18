let firstClickTime = null;
let secondClickTime = null;
// localStorageからデータを取得して配列を復元
let timeStamps = JSON.parse(localStorage.getItem('timeStamps')) || [];
let bpmRecords = JSON.parse(localStorage.getItem('bpmRecords')) || [];


// 初期化時に時刻を常に表示する
updateTime();
setInterval(updateTime, 1000); // 毎秒時刻を更新

// ボタンが押された際の処理
document.getElementById('pulseButton').addEventListener('click', function() {
    const now = new Date();
    const formattedTime = formatDate(now);
    
    if (firstClickTime === null) {
        firstClickTime = now;
        recordSign = document.getElementById('recording-sign');
        recordSign.style.backgroundColor ="#007bffff";
    } else {
        secondClickTime = now;
        const bpm = calculateBPM();
        
        // タイムスタンプと心拍数を保存
        timeStamps.push({ timestamp: formattedTime, label: "bpm" });
        bpmRecords.push({ timestamp: formattedTime, bpm: bpm });

        localStorage.setItem('timeStamps', JSON.stringify(timeStamps));
        localStorage.setItem('bpmRecords', JSON.stringify(bpmRecords));

        firstClickTime = null; // Reset after calculation

        recordSign = document.getElementById('recording-sign');
        recordSign.style.backgroundColor = "#007bff00";
    }
});

// BPMを計算する関数
function calculateBPM() {
    const timeDifference = (secondClickTime - firstClickTime) / 1000; // Difference in seconds
    const bpm = (60 / timeDifference).toFixed();
    document.getElementById('bpmValue').textContent = bpm;

    // 背景色をBPMに応じて変更
    const bpmNumber = parseInt(bpm);
    if (bpmNumber <= 60) {
        document.body.style.backgroundColor = '#f5c6cb';
    } else if (bpmNumber > 60 && bpmNumber < 100) {
        document.body.style.backgroundColor = '#ffeeba';
    } else if (bpmNumber >= 100) {
        document.body.style.backgroundColor = '#bee5eb';
    }

    return bpm;
}

// 現在時刻を表示する関数
function updateTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}`;

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

function toggleMenu() {
    const menu = document.getElementById('menu');
    const overlay = document.getElementById('overlay');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        menu.style.display = 'block';
        overlay.style.display = 'block';
    }
}

function closeMenu() {
    const menu = document.getElementById('menu');
    const overlay = document.getElementById('overlay');
    menu.style.display = 'none';
    overlay.style.display = 'none';
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
    closeMenu();

    let csvContent = 'TimeStamp,BPM,Label\n';

    const storedTimestampRecords = JSON.parse(localStorage.getItem('timeStamps')) || [];
    const storedBpmRecords = JSON.parse(localStorage.getItem('bpmRecords')) || [];

    // storedTimestampRecords.forEach(function(record) {
    //     csvContent += `${record.timestamp},${record.label}\n`;
    // });
    bpmIndex = 0;
    for (let i = 0; i < storedTimestampRecords.length; i++) {
        if (storedTimestampRecords[i].label == "bpm") {
            csvContent += `${storedTimestampRecords[i].timestamp},${storedBpmRecords[bpmIndex].bpm},${storedTimestampRecords[i].label}\n`;
            console.log(`${storedTimestampRecords[i].timestamp},${storedBpmRecords[bpmIndex].bpm},${storedTimestampRecords[i].label}\n`)
            bpmIndex += 1;
        } else {
            csvContent += `${storedTimestampRecords[i].timestamp},,${storedTimestampRecords[i].label}\n`;
            console.log(`${storedTimestampRecords[i].timestamp},,${storedTimestampRecords[i].label}\n`)
        }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const now = new Date();
    const fileName = `timestamp_${formatFileName(now)}.csv`; // ファイル名に現在の時刻を追加

    downloadFile(csvContent, fileName);

});

// データ消去機能
document.getElementById('deleteData').addEventListener('click', function() {
    closeMenu();

    const storedTimeStamps = JSON.parse(localStorage.getItem('timeStamps')) || [];
    
    if (storedTimeStamps.length === 0) {
        alert('保存されているデータがありません。');
        return;
    }

    const firstTimeStamp = storedTimeStamps[0];
    const lastTimeStamp = storedTimeStamps[storedTimeStamps.length - 1];
    console.log(firstTimeStamp);
    console.log(lastTimeStamp);
    const confirmationMessage = `${firstTimeStamp.timestamp}\n〜\n${lastTimeStamp.timestamp}\nのデータを消去しますか？`;

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

1. <b>出生時刻の記録</b>
 - 画面左下のボタンをクリックすることで出生時刻が記録されます。
 - ダウンロード（時刻）から記録をダウンロードできます。

2. <b>心拍数の計算</b>
 - 画面中央のボタンを脈拍に合わせて2回クリックします。
 - 2回目のクリック後、心拍数（BPM）がボタンの中に表示されます。

3. <b>データのダウンロード</b>
 - タイムスタンプのダウンロード:
  - 画面右上のハンバーガーメニュー（3本線のアイコン）をクリックします。
  - 「ダウンロード」を選択すると、計算された心拍数（BPM）とボタンが押されたタイムスタンプをCSV形式でダウンロードできます。
  - ファイル名は \`timestamp_yyyy-MM-dd-hh-mm-ss.csv\` という形式になります。

4. <b>データの消去</b>
 - データ消去:
  - ハンバーガーメニューをクリックし、「データ消去」を選択します。
  - 保存されているデータの最初と最後のタイムスタンプを確認するダイアログが表示され、「[先頭の時刻]〜[最後の時刻]のデータを消去しますか？」と確認されます。
  - 確認後、データはブラウザから消去されます。
`;

// モーダルを開く
document.getElementById('usageInfo').addEventListener('click', function() {
    closeMenu();
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

document.getElementById('birthButton').addEventListener('click', function () {
    const now = new Date();
    const formattedTime = formatDate(now);
    timeStamps.push({ timestamp: formattedTime, label: "birth" });
    localStorage.setItem('timeStamps', JSON.stringify(timeStamps));

    const birthModal = document.getElementById('birthModal');
    let modalText = document.getElementById('birth-modal-content')
    modalText.textContent = '出生ボタンが押されました'
    
    // モーダルを表示する
    birthModal.classList.add('show');
    
    // 2秒後にモーダルを非表示にする
    setTimeout(function () {
        birthModal.classList.remove('show');
    }, 2000);
});

document.getElementById('respirationButton').addEventListener('click', function () {
    const now = new Date();
    const formattedTime = formatDate(now);
    timeStamps.push({ timestamp: formattedTime, label: "respiration" });
    localStorage.setItem('timeStamps', JSON.stringify(timeStamps));

    const modal = document.getElementById('birthModal');
    let modalText = document.getElementById('birth-modal-content')
    modalText.textContent = '人工呼吸開始ボタンが押されました'
    
    // モーダルを表示する
    modal.classList.add('show');
    
    // 2秒後にモーダルを非表示にする
    setTimeout(function () {
        modal.classList.remove('show');
    }, 2000);
});

document.addEventListener('gesturestart', function (event) {
    event.preventDefault();
});