// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// ----------------------------------------------------
// 【Firebase】
// ----------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAHsN_Yxi13_06QVCnU-MSabdM9dFzJlO4",
  authDomain: "kakecafe-25695.firebaseapp.com",
  projectId: "kakecafe-25695",
  storageBucket: "kakecafe-25695.firebasestorage.app",
  messagingSenderId: "761704680546",
  appId: "1:761704680546:web:5266850af1bafb7ea1953b",
  measurementId: "G-HLSN74RB33"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 画面要素の取得
// ==========================================
const updateTimeEl = document.getElementById('update-time');
const congestionStatusEl = document.getElementById('congestion-status');
const soldoutListEl = document.getElementById('soldout-list');
const reloadBtn = document.getElementById('reload-btn');

// ==========================================
// メニューの定義（ここを書き換えることでメニューを変更できます）
// ==========================================
const MENU_CATEGORIES = [
  {
    categoryName: "Food",
    items: [
      "フライドポテト",
      "きんぴらパン",
      "チリドッグ",
      "ホットドッグ",
      "ぜんざい",
      "ミニパフェ",
      "パンナコッタ",
      "チョコチップスコーン",
      "ゼリー",
      "ポンデケージョ"
    ]
  },
  {
    categoryName: "Drink",
    items: [
      "ほうじ茶",
      "アイスコーヒー",
      "スイートミルクコーヒー",
      "モクテル"
    ]
  }
];
// 全てのメニューを取得するための補助配列
const MENU_ITEMS = MENU_CATEGORIES.flatMap(c => c.items);

// ==========================================
// データの取得と表示
// ==========================================
async function fetchAndDisplayData() {
  updateTimeEl.textContent = '読み込み中...';
  // ボタンを一時的に無効化
  reloadBtn.disabled = true;
  
  try {
    // ----------------------------------------------------
    // 【Firebaseからデータを取得する】
    // ----------------------------------------------------
    const docRef = doc(db, "cafe_status", "current");
    const docSnap = await getDoc(docRef);
    let data;

    if (docSnap.exists()) {
      data = docSnap.data();
    } else {
      // ドキュメントがまだ存在しない場合の初期データ
      data = {
        congestion: '空席あり',
        menuStatus: {},
        updatedAt: Date.now()
      };
    }

    // すぐに表示が変わると更新されたか分かりにくいため、少しだけ待機（UXのため）
    setTimeout(() => {
      renderStatus(data);
      reloadBtn.disabled = false;
    }, 500);

  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    updateTimeEl.textContent = 'エラー: ' + error.message;
    reloadBtn.disabled = false;
  }
}

function renderStatus(data) {
  // 日時のフォーマット (例: "14時30分現在")
  const date = new Date(data.updatedAt);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  updateTimeEl.textContent = `${hours}時${minutes}分現在`;

  // 混雑状況の表示
  congestionStatusEl.textContent = data.congestion;
  
  // 色の変更
  congestionStatusEl.className = 'status-display'; // 一度リセット
  if (data.congestion === '空席あり') {
    congestionStatusEl.classList.add('status-empty');
  } else if (data.congestion === 'やや混雑') {
    congestionStatusEl.classList.add('status-normal');
  } else if (data.congestion === '満席') {
    congestionStatusEl.classList.add('status-full');
  }

  // メニュー表の表示 (menuStatusがない古いデータの場合は、すべて提供中とみなす)
  const menuStatus = data.menuStatus || {};
  const menuListEl = document.getElementById('menu-list');
  if (menuListEl) {
    menuListEl.innerHTML = '';

    MENU_CATEGORIES.forEach(category => {
      // カテゴリ見出し
      const categoryHeader = document.createElement('li');
      categoryHeader.className = 'menu-category-header';
      categoryHeader.textContent = category.categoryName;
      menuListEl.appendChild(categoryHeader);

      category.items.forEach(itemName => {
        // デフォルトは提供中 (true) と解釈する
        const isAvailable = menuStatus[itemName] !== false;
        
        const li = document.createElement('li');
        li.className = isAvailable ? 'menu-item available' : 'menu-item sold-out';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'menu-name';
        nameSpan.textContent = itemName;

        const badgeSpan = document.createElement('span');
        badgeSpan.className = isAvailable ? 'badge badge-ok' : 'badge badge-ng';
        badgeSpan.textContent = isAvailable ? '提供中' : '終了';

        li.appendChild(nameSpan);
        li.appendChild(badgeSpan);
        menuListEl.appendChild(li);
      });
    });
  }
}

// ==========================================
// イベントリスナー
// ==========================================
reloadBtn.addEventListener('click', () => {
  fetchAndDisplayData();
});

// 初回読み込み
fetchAndDisplayData();
