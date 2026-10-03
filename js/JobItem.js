// JobItem.js - 表示待合併的 PDF 項目
class JobItem {
    constructor(id, fileId) {
        this.id = id;
        this.fileId = fileId;
        this.pages = [];        // 0-based 實際頁碼陣列
        this.pageSets = [];     // 使用者輸入的頁碼區間
        this.pagesStr = '';     // 原始輸入字串
        this.pagesToCombine = 0;       // count number of pages
        this.rotation = {       // rotation settings
            on: false,          // rotation on/off
            // mode: 'degree',     // rotation mode: degree, WYSIWYG
            // degree: {           // degree mode
            //     dir: 'ccw',         // rotate direction
            //     val: 90          // rotate degree
            // },
            // WYSIWYG: {           // WYSIWYG mode
            //     from: 'up',     // start direction
            //     to: 'down'      // end direction
            // }
        }
    }

    // 解析並驗證使用者輸入的頁碼字串，回傳是否成功
    setPagesStr(pagesStr, pageCnt) {
        const result = JobItem.getPagesInUsed(pagesStr, pageCnt);
        if (result.hasError) {
            return false;
        }
        this.pages = result.pages;
        this.pageSets = result.pageSets;
        this.pagesStr = pagesStr;
        this.pagesToCombine = result.pagesToCombine; 
        return true;
    }

    setRotation(mode, obj) {
        if (mode) {
            this.rotation = JSON.parse(JSON.stringify(obj));
        }
        else {
            this.rotation = {};
        }
    }

    // 重置所有頁面設定
    clearPages() {
        this.pages = [];
        this.pageSets = [];
        this.pagesStr = '';
        this.pagesToCombine = 0; 
        this.rotation = {on: false};
    }

    // 複製此實例，僅更換 id
    clone(newId) {
        const copy = new JobItem(newId, this.fileId);
        copy.pages = [...this.pages];
        copy.pageSets = this.pageSets.map(set => [...set]);
        copy.pagesStr = this.pagesStr;
        copy.pagesToCombine = this.pagesToCombine;
        copy.rotation = JSON.parse(JSON.stringify(this.rotation));
        return copy;
    }

    // 是否有自訂頁面
    hasCustomPages() {
        return this.pages.length > 0;
    }

    hasRotationSettings() {
        return this.rotation?.on;
    }

    getRotationDegree() {
        let degree = 0;
        const rotation = this.rotation;
        if (rotation.mode === 'degree') {
            if (rotation.degree.dir === 'cw') {
                degree = rotation.degree.val;
            }
            else {
                degree = -rotation.degree.val;
            }
        }
        else {
            degree = rotation.WYSIWYG.to - rotation.WYSIWYG.from;
        }
        return degree;
    }

    getPages() {
        return this.pages.concat();
    }

    getPageSets() {
        return this.pageSets.map(set => set.concat());
    }

    getPagesStr() {
        return this.pagesStr;
    }

    static getPagesInUsed(pagesStr, pageCnt) {
        let result = { hasError: false, pageSets: [], pages: [], pagesToCombine: 0 };
        let PagesTmp = {};
        pagesStr = pagesStr.replace(/[a-zA-Z\s\n]/g, '');
        result.hasError = pagesStr.split(',').some(function(i) {
            if (i.length < 1) return false;
            if (i.indexOf('-') == 0) return true;
            if (i.split('-').length > 2) return true;
            if (i.indexOf('-') > 0) {
                let [start, end] = i.split('-').map(n => parseInt(n, 10));
                if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > pageCnt || end > pageCnt || start > end) return true;
                if (start === end) {
                    result.pageSets.push([start]);
                    PagesTmp[start - 1] = 1;
                } else {
                    result.pageSets.push([start, end]);
                    for (let x = start - 1; x < end; x++){
                        PagesTmp[x] = 1;
                        result.pagesToCombine++;
                    }
                }
            } else {
                let num = parseInt(i, 10);
                if (isNaN(num) || num < 1 || num > pageCnt) return true;
                result.pageSets.push([num]);
                PagesTmp[num - 1] = 1;
                result.pagesToCombine++;
            }
        });
        result.pages = Object.keys(PagesTmp);
        return result;
    }
}

window.JobItem = JobItem; 