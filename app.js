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
// メニューの定義
// 各アイテムは { name, image(任意), subtitle(任意) } のオブジェクト
// subtitle: 後から編集する場合はコメントを外して文字列を設定してください
// ==========================================
const MENU_CATEGORIES = [
  {
    categoryName: "Food",
    items: [
      {
        name: "頑固おやじのきんぴらパン",
        image: "assets/Kimpira_bread_of_gankooyaji.jpg",
        subtitle: "美味しいなんてお世辞はいらない\n食べて笑顔になればいい",
      },
      {
        name: "ホットドッグ/チリドッグ",
        image: "assets/Hotdog_chilidog.jpg",
        subtitle: "ナモスバーガーの再現度99%\nあなたはHot OR Chili？",
        children: [
          { name: "ホットドッグ" },
          { name: "チリドッグ" },
        ]
      },
      {
        name: "揚げ物屋 MANABU",
        image: "assets/Agemonoya_manabu.jpg",
        subtitle: "気分もアゲアゲ？",
      },
      {
        name: "ポンデケージョだじょ。",
        image: "assets/Pão_de_Queijo_dajo.jpg",
        subtitle: "もちもちチーズパン。\nあすかの愛はデッケージョ。",
      },
      {
        name: "かおりんのぜんざい",
        image: "assets/Zenzai_of_kaorin.jpg",
        subtitle: "潜在能力全開！\nおいしさぜんだいみもん",
        children: [
          { name: "温（餅入り）" },
          { name: "冷（白玉入り）" }
        ]
      },
      {
        name: "ゆんゆんのパンナコッタ",
        image: "assets/Panna_cotta_of_yunyun.jpg",
        subtitle: "ナンテコッタ！？\nお口の中で奏でるおいしさ♪",
      },
      {
        name: "ミニ・パルフェ",
        image: "assets/Mini_parfait.jpg",
        subtitle: "今日の気分は何味？\nカスタム自由 シェフMAKI監修",
      },
      {
        name: "チョコチップスコーン",
        image: "assets/Chocolate_chip_scone.jpg",
        subtitle: "ヒロポンのやさしさと\nチョコたっぷり 甘さは控えめ",
      },
      {
        name: "オレンジパウンドケーキ",
        image: "assets/Orange_pound_cake.jpg",
        subtitle: "ふわっと香ってしっとり消える\n陽だまりあやちゃんの",
      },
    ]
  },
  {
    categoryName: "Drink",
    items: [
      {
        name: "Bar Ryoji",
        image: "assets/Bar_ryoji.jpg",
        subtitle: "やさしい時間を、一杯。",
        children: [
          { name: "ほうじ茶" },
          { name: "ホットコーヒー" },
          { name: "アイスコーヒー" },
          { name: "スイート\nミルクコーヒー" },
          { name: "モクテル" }
        ]
      }
    ]
  }
];
// 全てのメニューを取得するための補助配列
const MENU_ITEMS = MENU_CATEGORIES.flatMap(c =>
  c.items.flatMap(item => item.children ? item.children.map(ch => ch.name) : [item.name])
);

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

      // renderStatus 内の category.items.forEach を以下に置き換え
      category.items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'menu-item menu-item-parent';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'menu-info';

        if (item.image) {
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = item.name;
          img.className = 'menu-img';
          infoDiv.appendChild(img);
        }

        if (item.subtitle) {
          const subtitleSpan = document.createElement('span');
          subtitleSpan.className = 'menu-subtitle';
          subtitleSpan.textContent = item.subtitle;
          infoDiv.appendChild(subtitleSpan);
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'menu-name';
        nameSpan.textContent = item.name;
        infoDiv.appendChild(nameSpan);

        if (item.children) {
          // 子アイテムのバッジを横並びで表示
          const childrenDiv = document.createElement('div');
          childrenDiv.className = 'menu-children';

          item.children.forEach(child => {
            const raw = menuStatus[child.name];
            let status;
            if (raw === true || raw === undefined) status = 'available';
            else if (raw === false) status = 'soldout';
            else status = raw;

            const childSpan = document.createElement('div');
            childSpan.className = `menu-child${status === 'soldout' ? ' sold-out' : ''}`;

            const childName = document.createElement('span');
            childName.className = 'menu-child-name';
            childName.textContent = child.name;

            const badge = document.createElement('span');
            if (status === 'soldout') {
              badge.className = 'badge badge-ng';
              badge.textContent = '終了';
            } else if (status === 'few') {
              badge.className = 'badge badge-few';
              badge.textContent = 'あと少し';
            } else {
              badge.className = 'badge badge-ok';
              badge.textContent = '提供中';
            }

            childSpan.appendChild(childName);
            childSpan.appendChild(badge);
            childrenDiv.appendChild(childSpan);
          });

          infoDiv.appendChild(childrenDiv);
          li.appendChild(infoDiv);
        } else {
          // 通常アイテム
          const raw = menuStatus[item.name];
          let status;
          if (raw === true || raw === undefined) status = 'available';
          else if (raw === false) status = 'soldout';
          else status = raw;

          if (status === 'soldout') li.className = 'menu-item sold-out';
          else if (status === 'few') li.className = 'menu-item few-left';
          else li.className = 'menu-item available';

          const badge = document.createElement('span');
          if (status === 'soldout') {
            badge.className = 'badge badge-ng';
            badge.textContent = '終了';
          } else if (status === 'few') {
            badge.className = 'badge badge-few';
            badge.textContent = 'あと少し';
          } else {
            badge.className = 'badge badge-ok';
            badge.textContent = '提供中';
          }

          li.appendChild(infoDiv);
          li.appendChild(badge);
        }

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
