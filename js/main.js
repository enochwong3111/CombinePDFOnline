// import { genID, convertSize, showLoading, hideLoading, showAlert, downloadFile } from './utils.js';

window.JobItemList = {};

(function(panel){
    let docList;
    let emptyList;
    let files;
    let jobItemSeq;
    let jobItems = {};
    let jobItemViews = {};
    let buttons = {};
    let fileInput;
    let fileSettingModal;
    let curSettingItemId;
    let TYPE = {
        FILE: '_f_',
        ITEM: '_i_'
    }
    
    function init() {
        docList = $('[data-for="docList"]');
        emptyList = $('[data-for="emptyFileList"]');
        buttons = {
            selectAll: $('[btn-for="selectAll"]'),
            emptySelect: $('[btn-for="emptySelect"]'),
            chooseFile: $('[btn-for="chooseFile"]'),
            clear: $('[btn-for="clear"]'),
            removeSelected: $('[btn-for="removeSelected"]'),
            combine:  $('[btn-for="combine"]')
        }
        fileInput = $('[data-for="fileInput"]');
        JobItemJqObject.setTemplate($('[data-for="dummyItem"]')[0].outerHTML);
        fileSettingModal = $('#modalFileSetting');
        curSettingItemId = "";
        files = {};
        jobItemSeq = [];
        jobItems = {};
        drawItemList();
        bindGeneralEvents();
        hideLoading();
    }
    panel.init = init;

    function bindGeneralEvents() {

        buttons.selectAll.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            jobItemSeq.forEach(function(itemId) {
                jobItemViews[itemId].setSelected(true);
            });
            checkSelected();
        });

        buttons.emptySelect.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            jobItemSeq.forEach(function(itemId) {
                jobItemViews[itemId].setSelected(false);
            });
            clearLastSelectionState();
            checkSelected();
        });

        buttons.chooseFile.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            fileInput.click();
        });

        buttons.clear.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            docList.empty().hide();
            emptyList.show();
            files = {};
            jobItemSeq = [];
            jobItems = {};
            drawItemList();
        });

        buttons.removeSelected.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            let removeItemList = [];
            jobItemSeq.forEach(function(itemId) {
                if(jobItemViews[itemId].isSelected()) {
                    removeItemList.push(itemId);
                }
            });
            removeItems(removeItemList);
        });

        buttons.combine.off('click').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            showLoading();
            combinePDFs();
        });

        fileSettingModal.on('show.bs.modal', function (event) {
            curSettingItemId = $(event.relatedTarget).parents('[data-id]').eq(0).attr('data-id');
            if (jobItems[curSettingItemId].pagesStr) {
                fileSettingModal.find('#pagesInput').val(jobItems[curSettingItemId].pagesStr);
            } else {
                fileSettingModal.find('#pagesInput').val('');
            }
        });

        fileSettingModal.find('[btn-for="confirmItemSetting"]').off('click').click(function(e) {
            let value = fileSettingModal.find('#pagesInput').val();
            value = value.replace(/[^0-9-,\n\s]/g, '').trim();
            fileSettingModal.find('#pagesInput').val(value);
            let curJobItem = jobItems[curSettingItemId];
            let pageCnt = files[curJobItem.fileId].pageCnt;
            try {
                if (!curJobItem.setPagesStr(value, pageCnt)) {
                    console.error('fail!!');
                    showAlert("Invalid Input!");
                    return;
                }
                jobItemViews[curSettingItemId].updateBadge();
                fileSettingModal.find('#pagesInput').val('');
                bootstrap.Modal.getInstance(fileSettingModal[0]).hide();
                curSettingItemId = "";
            } catch(error) {
                console.error('fail!!');
                showAlert("Unknown Error");
            }
        });

        docList.sortable({
            axis: "y",
            containment: "parent",
            helper: "clone",
            forceHelperSize: true,
            handle: '[btn-for="reorderFile"]',
            update: function(event, ui) {
                let itemSeqTmp = [];
                docList.children().each(function() {
                    itemSeqTmp.push($(this).attr('data-id'));
                });
                jobItemSeq = itemSeqTmp;
            }
        });

        fileInput.change(function(e) {
            showLoading();
            let tmpFiles = e.target.files;
            let tmpFileList = [];
            Object.keys(tmpFiles).forEach(function(i) {
                let fileId = genID(i, TYPE.FILE);
                let itemId = genID(i, TYPE.ITEM);
                jobItems[itemId] = new JobItem(itemId, fileId);
                jobItemSeq.push(itemId);
                files[fileId] = tmpFiles[i];
                files[fileId].inUsedCnt = 1;
                tmpFileList.push(fileId);
            });
            getNewFilesInfo(tmpFileList).catch(() => {
                // 當發生錯誤時，移除已加入的檔案
                tmpFileList.forEach(fileId => {
                    delete files[fileId];
                });
                jobItemSeq = jobItemSeq.filter(id => !tmpFileList.includes(jobItems[id].fileId));
                tmpFileList.forEach(fileId => {
                    Object.keys(jobItems).forEach(itemId => {
                        if (jobItems[itemId].fileId === fileId) {
                            delete jobItems[itemId];
                        }
                    });
                });
                hideLoading();
            });
            e.target.value = "";
        });
    }

    async function getNewFilesInfo(newFileList) {
        await Promise.all(newFileList.map(async fileId => {
            let buf = await files[fileId].arrayBuffer();
            try {
                let pdf = await PDFLib.PDFDocument.load(buf);
                let file = files[fileId];
                file.pageCnt = pdf.getPageCount();
                file.sizeStr = convertSize(file);
            } catch (error) {
                if (error.message.includes('encrypted')) {
                    //無法讀取加密的 PDF 檔案
                    showAlert('Failed to read encrypted PDF file(s)');
                } else {
                    //讀取 PDF 檔案時發生錯誤
                    showAlert('Failed to read PDF file(s)');
                }
                throw error;
            }
        }));
        drawItemList();
    }

    function drawItemList() {
        docList.empty();
        if (jobItemSeq.length) {
            emptyList.hide();
            jobItemSeq.forEach(function(itemId) {
                drawItem(itemId);
            });
            docList.show();
            buttons.clear.prop('disabled', false);
            buttons.combine.prop('disabled', false);
            buttons.selectAll.prop('disabled', false);
            buttons.removeSelected.prop('disabled', true);
            buttons.emptySelect.hide().prop('disabled', false);
        }
        else {
            docList.hide();
            buttons.emptySelect.hide();
            emptyList.show();
            buttons.clear.prop('disabled', true);
            buttons.combine.prop('disabled', true);
            buttons.selectAll.prop('disabled', true);
            buttons.removeSelected.prop('disabled', true);
            buttons.emptySelect.hide().prop('disabled', false);
        }
        hideLoading();
    }

    function drawItem(itemId) {
        // 使用 JobItemJqObject 來渲染與綁定
        let jobItem = jobItems[itemId];
        let file = files[jobItem.fileId];
        let view = new JobItemJqObject(jobItem, file);
        jobItemViews[itemId] = view;
        docList.append(view.render());
        view.bindEvents({
            onSelect: (id, selected) => {
                checkSelected();
            },
            onItemClick: id => {
                checkSelected();
            },
            onPreview: fileId => previewPDF(fileId),
            onRemove: list => removeItems(list),
            onCopy: id => {
                let newId = genID(jobItemSeq.length, TYPE.ITEM);
                jobItems[newId] = jobItems[id].clone(newId);
                files[jobItem.fileId].inUsedCnt++;
                jobItemSeq.splice(jobItemSeq.indexOf(id), 0, newId);
                drawItemList();
            },
        });
    }

    function clearLastSelectionState() {
        docList.find('.clicked').removeClass('clicked');
    }
    JobItemList.clearLastSelectionState = clearLastSelectionState;

    async function previewPDF(fileId) {
        let pdfDoc2 = await PDFLib.PDFDocument.load(await files[fileId].arrayBuffer());
        let pdfDataUri = await pdfDoc2.saveAsBase64({ dataUri: true });
        document.getElementById('PDFPreview').src = pdfDataUri;
    }

    function removeItems(removeItemList) {
        removeItemList.forEach(function(itemId) {
            fileId = jobItems[itemId].fileId;
            jobItemSeq.splice(jobItemSeq.indexOf(itemId), 1);
            delete jobItems[itemId];
            if (files[fileId].inUsedCnt == 1) {
                delete files[fileId];
            } else {
                files[fileId].inUsedCnt--;
            }
        });
        drawItemList();
    }

    function checkSelected() {
        if (docList.find('input:checked').length) {
            buttons.removeSelected.prop('disabled', false);
            buttons.emptySelect.show().prop('disabled', false);
        } else {
            buttons.removeSelected.prop('disabled', true);
            buttons.emptySelect.hide().prop('disabled', true);
        }
    }

    async function combinePDFs() {
        let pdfDoc = await PDFLib.PDFDocument.create();
        let reusablePages = {};
        for (let i in jobItemSeq) {
            let itemId = jobItemSeq[i];
            let fileId = jobItems[itemId].fileId;
            let file = files[fileId];
            let readPages = jobItems[itemId].getPages();
            if (reusablePages[fileId]) {
                let readPagesTmp = [];
                let hasAdditionalPages = false;
                readPages.forEach(function(pageN) {
                    if (!reusablePages[fileId][pageN]) {
                        readPagesTmp.push(pageN);
                        hasAdditionalPages = true;
                    }
                });
                if (hasAdditionalPages) {
                    readPages = readPagesTmp;
                }
            } else {
                reusablePages[fileId] = {};
            }
            if (!jobItems[itemId].hasCustomPages()) {
                let srcDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
                let copiedPages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
                copiedPages.forEach((page) => pdfDoc.addPage(page));
            } else {
                if (readPages.length > 0) {
                    let srcDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
                    let copiedPages = await pdfDoc.copyPages(srcDoc, readPages);
                    for (let x in readPages) {
                        let pageN = readPages[x];
                        reusablePages[fileId][pageN] = copiedPages[x];
                    }
                }
                let pageSets = jobItems[itemId].getPageSets();
                for (let x in pageSets) {
                    let pageSet = pageSets[x];
                    if (pageSet.length > 1) {
                        for (let k = pageSet[0] - 1; k < pageSet[1]; k++) {
                            pdfDoc.addPage(reusablePages[fileId][k]);
                        }
                    } else {
                        pdfDoc.addPage(reusablePages[fileId][pageSet[0] - 1]);
                    }
                }
            }
        }
        let pdfBytes = await pdfDoc.save();
        let blob = new Blob( [ pdfBytes ], { type: "application/pdf" } );
        downloadFile(blob, "combinedPDF.pdf");
        hideLoading();
    }

    function printFiles() {
        console.log(files);
    }
    panel.printFiles = printFiles;

    /**
     * Select a range of items between two IDs inclusive
     */
    function selectRange(fromId, toId) {
        let fromIdx = jobItemSeq.indexOf(fromId);
        let toIdx = jobItemSeq.indexOf(toId);
        if (fromIdx === -1 || toIdx === -1) return;
        let start = Math.min(fromIdx, toIdx);
        let end = Math.max(fromIdx, toIdx);
        for (let i = start; i <= end; i++) {
            let id = jobItemSeq[i];
            jobItemViews[id].setSelected(true);
        }
        checkSelected();
    }
    panel.selectRange = selectRange;

    function getLastClickedItemId() {
        let lastClickedItem = docList.find('.clicked');
        if (lastClickedItem.length) {
            return lastClickedItem.attr('data-id');
        }
        return null;
    }
    panel.getLastClickedItemId = getLastClickedItemId;
}(JobItemList));

$(function() {
    JobItemList.init();
});