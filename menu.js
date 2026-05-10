// menu.js — メニュー定義（共通）
//
// 各アイテムのフィールド：
//   name     : メニュー名（必須）
//   children : サブメニュー配列（任意）
//   image    : 画像パス       ── app.js のみ参照
//   subtitle : 説明文         ── app.js のみ参照
//   takeout  : テイクアウト可 ── app.js のみ参照
 
export const MENU_CATEGORIES = [
  {
    categoryName: "Food",
    items: [
      {
        name: "頑固おやじのきんぴらパン",
        image: "assets/Kimpira_bread_of_gankooyaji.jpg",
        subtitle: "美味しいなんてお世辞はいらない\n食べて笑顔になればいい",
        takeout: true
      },
      {
        name: "ホットドッグ/チリドッグ",
        image: "assets/Hotdog_chilidog.jpg",
        subtitle: "ナモスバーガーの再現度99%\nあなたはHot OR Chili？",
        children: [
          { name: "ホットドッグ" },
          { name: "チリドッグ" }
        ]
      },
      {
        name: "揚げ物屋 MANABU",
        image: "assets/Agemonoya_manabu.jpg",
        subtitle: "気分もアゲアゲ？",
        children: [
          { name: "フライドポテト" },
          { name: "チーズいももち" },
          { name: "チュロス" }
        ]
      },
      {
        name: "ポンデケージョだじょ。",
        image: "assets/Pão_de_Queijo_dajo.jpg",
        subtitle: "もちもちチーズパン。\nあすかの愛はデッケージョ。",
        takeout: true
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
        takeout: true
      },
      {
        name: "ミニ・パルフェ",
        image: "assets/Mini_parfait.jpg",
        subtitle: "今日の気分は何味？\nカスタム自由 シェフMAKI監修"
      },
      {
        name: "チョコチップスコーン",
        image: "assets/Chocolate_chip_scone.jpg",
        subtitle: "ヒロポンのやさしさと\nチョコたっぷり 甘さは控えめ",
        takeout: true
      },
      {
        name: "オレンジパウンドケーキ",
        image: "assets/Orange_pound_cake.jpg",
        subtitle: "ふわっと香ってしっとり消える\n陽だまりあやちゃんの",
        takeout: true
      }
    ]
  },
  {
    categoryName: "Drink (BAR RYOJI)",
    items: [
      {
        name: "COFEE・TEA",
        image: "assets/Bar_ryoji.jpg",
        subtitle: "やさしい時間を、一杯。",
        children: [
          { name: "ホットコーヒー" },
          { name: "アイスコーヒー" },
          { name: "ほうじ茶" },
          { name: "スイート\nミルクコーヒー" }
        ]
      },
      {
        name: "MOCKTAIL",
        children: [
          { name: "シャーリーテンプル" },
          { name: "アリゾナサンセット" },
          { name: "シンデレラ" },
          { name: "スパイシーコーラ" }
        ]
      },
      {
        name: "SOFTDRINK",
        children: [
          { name: "メロンソーダ\n（フロート可）" },
          { name: "レモネードタカタ" }
        ]
      }
    ]
  }
];
 
/** 状態管理対象の全メニュー名（フラット配列）*/
export const MENU_ITEMS = MENU_CATEGORIES.flatMap(c =>
  c.items.flatMap(item =>
    item.children ? item.children.map(ch => ch.name) : [item.name]
  )
);
 
/**
 * menuStatus の値をステータス文字列に正規化する
 * @param {*} raw  
 * @returns {"available"|"few"|"soldout"}
 */
export function resolveStatus(raw) {
  return raw ?? 'available';
}