// app.js

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from './firebase.js';
import { MENU_CATEGORIES, resolveStatus } from './menu.js';

// ==========================================
// 画面要素の取得
// ==========================================
const updateTimeEl      = document.getElementById('update-time');
const congestionStatusEl = document.getElementById('congestion-status');
const reloadBtn         = document.getElementById('reload-btn');

// ==========================================
// データの取得と表示
// ==========================================
async function fetchAndDisplayData() {
  updateTimeEl.textContent = '読み込み中...';
  reloadBtn.disabled = true;

  try {
    const docSnap = await getDoc(doc(db, "cafe_status", "current"));
    const data = docSnap.exists()
      ? docSnap.data()
      : { congestion: '空席あり', menuStatus: {}, updatedAt: Date.now() };

    // すぐに変わると更新が分かりにくいため少し待機
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
  // 時刻表示
  const date = new Date(data.updatedAt);
  const hours   = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  updateTimeEl.textContent = `${hours}時${minutes}分現在`;

  // 混雑状況
  congestionStatusEl.textContent = data.congestion;
  congestionStatusEl.className = 'status-display';
  const congestionClass = {
    '空席あり': 'status-empty',
    'やや混雑': 'status-normal',
    '満席'    : 'status-full',
    '準備中'  : 'status-preparing'
  }[data.congestion];
  if (congestionClass) congestionStatusEl.classList.add(congestionClass);

  // メニュー一覧
  const menuStatus  = data.menuStatus || {};
  const menuListEl  = document.getElementById('menu-list');
  if (!menuListEl) return;
  menuListEl.innerHTML = '';

  MENU_CATEGORIES.forEach(category => {
    const categoryHeader = document.createElement('li');
    categoryHeader.className = 'menu-category-header';
    categoryHeader.textContent = category.categoryName;
    menuListEl.appendChild(categoryHeader);

    category.items.forEach(item => {
      const li      = document.createElement('li');
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

      if (item.takeout) {
        const takeoutSpan = document.createElement('span');
        takeoutSpan.className = 'menu-takeout';
        takeoutSpan.textContent = '- テイクアウト可';
        infoDiv.appendChild(takeoutSpan);
      }

      if (item.children) {
        li.className = 'menu-item menu-item-parent';
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'menu-children';

        item.children.forEach(child => {
          const status    = resolveStatus(menuStatus[child.name]);
          const childSpan = document.createElement('div');
          childSpan.className = `menu-child${status === 'soldout' ? ' sold-out' : ''}`;

          const childName = document.createElement('span');
          childName.className = 'menu-child-name';
          childName.textContent = child.name;

          childSpan.appendChild(childName);
          childSpan.appendChild(makeBadge(status));
          childrenDiv.appendChild(childSpan);
        });

        infoDiv.appendChild(childrenDiv);
        li.appendChild(infoDiv);

      } else {
        const status = resolveStatus(menuStatus[item.name]);
        li.className = `menu-item ${{ soldout: 'sold-out', few: 'few-left', available: 'available' }[status]}`;
        li.appendChild(infoDiv);
        li.appendChild(makeBadge(status));
      }

      menuListEl.appendChild(li);
    });
  });
}

/** ステータスバッジ要素を生成 */
function makeBadge(status) {
  const badge = document.createElement('span');
  const MAP = {
    soldout  : ['badge badge-ng',  '終了'],
    few      : ['badge badge-few', 'あと少し'],
    available: ['badge badge-ok',  '提供中']
  };
  const [cls, text] = MAP[status] ?? MAP.available;
  badge.className = cls;
  badge.textContent = text;
  return badge;
}

// ==========================================
// イベントリスナー
// ==========================================
reloadBtn.addEventListener('click', fetchAndDisplayData);

// 初回読み込み
fetchAndDisplayData();