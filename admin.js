// admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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
// 合言葉の設定
// ==========================================
const SECRET_PASSWORD = "staff";

// ==========================================
// 画面要素の取得
// ==========================================
// ログイン部分
const loginSection = document.getElementById('login-section');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');

const saveMessage = document.getElementById('save-message');

// ==========================================
// メニューの定義（ここを書き換えることでメニューを変更できます）
// ※app.jsと同じリストにしてください
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

// 管理画面部分
const adminSection = document.getElementById('admin-section');
const congestionRadios = document.getElementsByName('congestion');
const adminMenuListEl = document.getElementById('admin-menu-list');
const saveBtn = document.getElementById('save-btn');

// ==========================================
// ログイン処理
// ==========================================
function attemptLogin() {
  const userInput = passwordInput.value;
  if (userInput === SECRET_PASSWORD) {
    // ログイン成功: 管理画面を表示して、現在のデータを読み込む
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    fetchCurrentData();
  } else {
    // ログイン失敗
    loginError.style.display = 'block';
  }
}

loginBtn.addEventListener('click', attemptLogin);

// Enterキーでもログインできるようにする
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    attemptLogin();
  }
});

// ==========================================
// データの取得 (フォームの初期値に設定)
// ==========================================
async function fetchCurrentData() {
  try {
    // 【Firebaseから取得】
    const docRef = doc(db, "cafe_status", "current");
    const docSnap = await getDoc(docRef);
    let data;
    if (docSnap.exists()) {
      data = docSnap.data();
    }
    
    if (data && data.congestion) {
      // 混雑状況のラジオボタンを選択
      for (const radio of congestionRadios) {
        if (radio.value === data.congestion) {
          radio.checked = true;
          break;
        }
      }
    }

    // メニューごとの切り替えボタンを生成
    const menuStatus = data ? (data.menuStatus || {}) : {};
    if (adminMenuListEl) {
      adminMenuListEl.innerHTML = '';

      MENU_CATEGORIES.forEach(category => {
        // カテゴリヘッダー
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'admin-category-header';
        categoryHeader.textContent = category.categoryName;
        adminMenuListEl.appendChild(categoryHeader);

        category.items.forEach(itemName => {
          const index = MENU_ITEMS.indexOf(itemName);
          // デフォルトは提供中 (true) と解釈
          const isAvailable = menuStatus[itemName] !== false;
          
          const rowDiv = document.createElement('div');
          rowDiv.className = 'admin-menu-row';
          
          const nameLabel = document.createElement('span');
          nameLabel.className = 'admin-menu-name';
          nameLabel.textContent = itemName;

          const toggleDiv = document.createElement('div');
          toggleDiv.className = 'toggle-group';
          
          // 提供中ラジオ
          const radioOk = document.createElement('input');
          radioOk.type = 'radio';
          radioOk.name = `menu_${index}`;
          radioOk.value = 'true';
          if (isAvailable) radioOk.checked = true;
          
          const labelOk = document.createElement('label');
          labelOk.appendChild(radioOk);
          labelOk.appendChild(document.createTextNode(' 提供中'));

          // 終了ラジオ
          const radioNg = document.createElement('input');
          radioNg.type = 'radio';
          radioNg.name = `menu_${index}`;
          radioNg.value = 'false';
          if (!isAvailable) radioNg.checked = true;

          const labelNg = document.createElement('label');
          labelNg.appendChild(radioNg);
          labelNg.appendChild(document.createTextNode(' 終了'));

          toggleDiv.appendChild(labelOk);
          toggleDiv.appendChild(labelNg);
          
          rowDiv.appendChild(nameLabel);
          rowDiv.appendChild(toggleDiv);
          adminMenuListEl.appendChild(rowDiv);
        });
      });
    }

  } catch (error) {
    console.error("データの読み込みに失敗しました", error);
  }
}

// ==========================================
// データの保存処理
// ==========================================
async function saveData() {
  saveBtn.disabled = true;
  saveBtn.textContent = '保存中...';
  saveMessage.textContent = '';
  
  // 選択された混雑状況を取得
  let selectedCongestion = '空席あり';
  for (const radio of congestionRadios) {
    if (radio.checked) {
      selectedCongestion = radio.value;
      break;
    }
  }
  
  // メニューの状況を収集
  const currentMenuStatus = {};
  MENU_ITEMS.forEach((itemName, index) => {
    const radios = document.getElementsByName(`menu_${index}`);
    let isAvailable = true;
    for (const radio of radios) {
      if (radio.checked) {
        isAvailable = (radio.value === 'true');
      }
    }
    currentMenuStatus[itemName] = isAvailable;
  });

  const now = Date.now();
  
  const newData = {
    congestion: selectedCongestion,
    menuStatus: currentMenuStatus,
    updatedAt: now
  };

  try {
    // 【Firebaseへ保存】
    const docRef = doc(db, "cafe_status", "current");
    await setDoc(docRef, newData);

    // 保存完了の表示
    saveMessage.textContent = '更新が完了しました！お客様ページに反映されました。';
    saveMessage.style.color = 'var(--status-empty)'; // 緑色
    
    setTimeout(() => {
      saveMessage.textContent = '';
    }, 5000);

  } catch (error) {
    console.error("保存エラー:", error);
    saveMessage.textContent = 'エラーが発生しました。もう一度お試しください。';
    saveMessage.style.color = 'var(--status-full)'; // 赤色
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'この内容で更新する';
  }
}

saveBtn.addEventListener('click', saveData);
