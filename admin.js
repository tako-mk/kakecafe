// admin.js

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from './firebase.js';
import { MENU_CATEGORIES, MENU_ITEMS, resolveStatus } from './menu.js';

// ==========================================
// 合言葉の設定
// ==========================================
const SECRET_PASSWORD = "1111";

// ==========================================
// 画面要素の取得
// ==========================================
const loginSection    = document.getElementById('login-section');
const passwordInput   = document.getElementById('password-input');
const loginBtn        = document.getElementById('login-btn');
const loginError      = document.getElementById('login-error');
const adminSection    = document.getElementById('admin-section');
const congestionRadios = document.getElementsByName('congestion');
const adminMenuListEl = document.getElementById('admin-menu-list');
const saveBtn         = document.getElementById('save-btn');
const saveMessage     = document.getElementById('save-message');

// ==========================================
// ログイン処理
// ==========================================
function attemptLogin() {
  // 全角数字 → 半角に変換してから比較
  const userInput = passwordInput.value
    .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

  if (userInput === SECRET_PASSWORD) {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    fetchCurrentData();
  } else {
    loginError.style.display = 'block';
  }
}

loginBtn.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') attemptLogin(); });

// ==========================================
// データの取得（フォーム初期値に設定）
// ==========================================
async function fetchCurrentData() {
  try {
    const docSnap = await getDoc(doc(db, "cafe_status", "current"));
    const data = docSnap.exists() ? docSnap.data() : null;

    // 混雑状況ラジオボタンの復元
    if (data?.congestion) {
      for (const radio of congestionRadios) {
        if (radio.value === data.congestion) { radio.checked = true; break; }
      }
    }

    // メニュー切り替えUIの生成
    const menuStatus = data?.menuStatus ?? {};
    if (!adminMenuListEl) return;
    adminMenuListEl.innerHTML = '';

    MENU_CATEGORIES.forEach(category => {
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'admin-category-header';
      categoryHeader.textContent = category.categoryName;
      adminMenuListEl.appendChild(categoryHeader);

      category.items.forEach(item => {
        if (item.children) {
          const parentLabel = document.createElement('div');
          parentLabel.className = 'admin-parent-label';
          parentLabel.textContent = item.name;
          adminMenuListEl.appendChild(parentLabel);

          item.children.forEach(child => {
            adminMenuListEl.appendChild(
              makeMenuRow(child.name, menuStatus, '└ ')
            );
          });
        } else {
          adminMenuListEl.appendChild(makeMenuRow(item.name, menuStatus));
        }
      });
    });

  } catch (error) {
    console.error("データの読み込みに失敗しました", error);
  }
}

/**
 * メニュー行（ラジオボタン付き）を生成して返す
 * @param {string} itemName
 * @param {Object} menuStatus
 * @param {string} [prefix='']  子アイテムのインデント文字
 */
function makeMenuRow(itemName, menuStatus, prefix = '') {
  const index  = MENU_ITEMS.indexOf(itemName);
  const status = resolveStatus(menuStatus[itemName]);

  const rowDiv   = document.createElement('div');
  rowDiv.className = prefix ? 'admin-menu-row admin-menu-row-child' : 'admin-menu-row';

  const nameLabel = document.createElement('span');
  nameLabel.className = 'admin-menu-name';
  nameLabel.textContent = prefix + itemName;

  const toggleDiv = document.createElement('div');
  toggleDiv.className = 'toggle-group';

  [
    ['available', ' 提供中'],
    ['few',       ' あと少し'],
    ['soldout',   ' 終了']
  ].forEach(([val, label]) => {
    const radio = document.createElement('input');
    radio.type  = 'radio';
    radio.name  = `menu_${index}`;
    radio.value = val;
    if (status === val) radio.checked = true;

    const labelEl = document.createElement('label');
    labelEl.appendChild(radio);
    labelEl.appendChild(document.createTextNode(label));
    toggleDiv.appendChild(labelEl);
  });

  rowDiv.appendChild(nameLabel);
  rowDiv.appendChild(toggleDiv);
  return rowDiv;
}

// ==========================================
// データの保存処理
// ==========================================
async function saveData() {
  saveBtn.disabled = true;
  saveBtn.textContent = '保存中...';
  saveMessage.textContent = '';

  // 混雑状況
  let selectedCongestion = '空席あり';
  for (const radio of congestionRadios) {
    if (radio.checked) { selectedCongestion = radio.value; break; }
  }

  // メニュー状況
  const currentMenuStatus = {};
  MENU_ITEMS.forEach((itemName, index) => {
    const radios = document.getElementsByName(`menu_${index}`);
    for (const radio of radios) {
      if (radio.checked) { currentMenuStatus[itemName] = radio.value; break; }
    }
  });

  try {
    await setDoc(doc(db, "cafe_status", "current"), {
      congestion: selectedCongestion,
      menuStatus: currentMenuStatus,
      updatedAt: Date.now()
    });

    saveMessage.textContent = '更新が完了しました！お客様ページに反映されました。';
    saveMessage.style.color = 'var(--status-empty)';
    setTimeout(() => { saveMessage.textContent = ''; }, 5000);

  } catch (error) {
    console.error("保存エラー:", error);
    saveMessage.textContent = 'エラーが発生しました。もう一度お試しください。';
    saveMessage.style.color = 'var(--status-full)';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'この内容で更新する';
  }
}

saveBtn.addEventListener('click', saveData);