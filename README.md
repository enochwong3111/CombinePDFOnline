# PDF Combine Web Tool

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/enochwong3111/CombinePDFOnline/blob/main/README.md)
[![tc](https://img.shields.io/badge/lang-tc-blue.svg)](https://github.com/enochwong3111/CombinePDFOnline/blob/main/README.tc.md)

A lightweight client-side PDF merging tool built with `pdf-lib`, `jQuery`, and `Bootstrap`. It supports multi-file selection, custom page range specification, drag-and-drop ordering, and combined PDF download.

## Features

- Multi-file selection and listing (filename, size, page count)
- PDF preview with an embedded iframe; large files display a warning
- Customizable page range merging (e.g., `1, 3-5`)
- Drag-and-drop ordering of PDF files
- Single-click merging and downloading of the combined PDF

## Technology Stack

- HTML5 & CSS3 (`Bootstrap 5`)
- `jQuery` & `jQuery UI` (sortable)
- `pdf-lib` for front-end PDF manipulation
- Modular code: `constants.js`, `utils.js`, `JobItem.js`, `JobItemJqObject.js`, `main.js`

## Directory Structure

```
.
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── constants.js
│   ├── utils.js
│   ├── JobItem.js
│   ├── JobItemJqObject.js
└── └── main.js
```

## Usage

1. Open the web application at:
   https://enochwong3111.github.io/CombinePDFOnline/
2. Click **Add File(s)** to select PDF documents.
3. Adjust page ranges and file order as needed.
4. Click **Combine** to generate and download the merged PDF.
