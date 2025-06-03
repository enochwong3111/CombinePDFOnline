// utils.js - 共用工具函式

let alertMsgTimeOut = null;

function genID(i, type) {
    return new Date().getTime() + type + i;
}

function convertSize(file) {
    let B = file.size;
    file.viewable = true;
    if (B < 1000) return B + 'B';
    let KB = B / 1024;
    if (KB < 1000) return KB.toFixed(2) + 'KB';
    let MB = KB / 1024;
    file.viewable = MB < 1.5;
    return MB.toFixed(2) + 'MB';
}

function showLoading() {
    $('#loadingBg').show();
}

function hideLoading() {
    $('#loadingBg').hide();
}

function showAlert(msg) {
    let alert = $('[data-for="alert"]');
    alert.find('[data-for="errMsg"]').text(msg);
    alert.addClass('show');
    clearTimeout(alertMsgTimeOut);
    alertMsgTimeOut = setTimeout(() => alert.removeClass('show'), 3000);
}

function downloadFile(blob, fileName) {
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
} 