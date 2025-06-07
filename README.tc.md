# PDF Combine Web Tool
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/enochwong3111/CombinePDFOnline/blob/main/README.md)
[![tc](https://img.shields.io/badge/lang-tc-blue.svg)](https://github.com/enochwong3111/CombinePDFOnline/blob/main/README.tc.md)

一個輕量級的前端 PDF 合併工具，使用 `pdf-lib`、`jQuery` 與 `Bootstrap` 實現多檔 PDF 的預覽、頁面選擇、排序與合併下載。

https://github.com/user-attachments/assets/ff55cdb7-0b68-4b91-8a65-dd8cfb897329

## 功能

- 多檔案選取與列表顯示（檔名、大小、頁數）
- 按住 Shift 可選取連續多個檔案
- 將 PDF 檔案拖放到列表中進行新增
- 拖放排序合併順序
- 檔案預覽（內嵌 `iframe`），大檔以提示代替
- 自訂頁碼範圍合併（例如 `1,3-5`）
- 一鍵合併並下載結果

## 技術棧

- HTML5 + CSS3（`Bootstrap 5`）
- `jQuery` + `jQuery UI`（拖放排序）
- `pdf-lib`（前端 PDF 操作）
- 模組化自訂：`utils.js`、`JobItem.js`、`JobItemJqObject.js`、`main.js`

## 專案結構

```
.
├─ index.html
├─ css/
│  ├─ main.css
├─ js/
│  ├─ utils.js
│  ├─ JobItem.js
│  ├─ JobItemJqObject.js
└  └─ main.js
```

## 使用

1. 開啟：<a href="https://enochwong3111.github.io/CombinePDFOnline/" target="_blank">Link</a>
2. 點擊「Add File(s)」或將 PDF 檔案拖放到列表中新增文件
3. 調整頁碼範圍，按住 Shift 可選取連續多個檔案，並可獨立拖放排序
4. 按「Combine」合併並下載 PDF
