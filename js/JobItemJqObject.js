// js/JobItemJqObject.js - UI rendering wrapper for JobItem
(function(){
    // JobItemJqObject class 封裝單一項目的 DOM 操作
    function JobItemJqObject(jobItem, file) {
        this.jobItem = jobItem;
        this.file = file;
        this.$el = $(JobItemJqObject.TEMPLATE);
        // cache 內部元素
        this.$checkbox = this.$el.find('input[type="checkbox"]');
        this.$fileName = this.$el.find('[data-for="fileName"]');
        this.$fileSize = this.$el.find('[data-for="fileSize"]');
        this.$pageCnt = this.$el.find('[data-for="pageCnt"]');
        this.$previewBtn = this.$el.find('[btn-for="previewFile"]');
        this.$largePreviewBtn = this.$el.find('[btn-for="previewLargeFile"]');
        this.$badge = this.$el.find('[data-for="badge"]');
        this.$badgeCount = this.$badge.find('[data-for="pageUsed"]');
        this.$copyBtn = this.$el.find('[btn-for="copyFile"]');
        this.$removeBtn = this.$el.find('[btn-for="removeFile"]');
        this.$settingBtn = this.$el.find('[btn-for="setting"]');
        this.$reorderBtn = this.$el.find('[btn-for="reorderFile"]');
    }

    // 模板內容
    JobItemJqObject.TEMPLATE = '';
    JobItemJqObject.setTemplate = function(templateHtml) {
        JobItemJqObject.TEMPLATE = templateHtml;
    }

    // 綁定事件，callbacks: { onSelect, onItemClick, onPreview, onRemove, onCopy, onSetting }
    JobItemJqObject.prototype.bindEvents = function(callbacks) {
        let self = this;
        this.$checkbox.off().on('change', function(e){
            e.stopPropagation();
            if(callbacks.onSelect) callbacks.onSelect(self.jobItem.id, $(this).prop('checked'));
        });
        this.$el.off('click').on('click', function(e){
            e.stopPropagation();
            if (e.target == self.$settingBtn[0]) {
                return;
            }
            let lastClickedItemId = JobItemList.getLastClickedItemId();
            if (e.shiftKey && lastClickedItemId && lastClickedItemId != self.jobItem.id) {
                if (e.target === self.$checkbox[0]) {
                    // if the checkbox is clicked, revert the checkbox state before selectting range
                    self.$checkbox.prop('checked', !self.$checkbox.prop('checked'));
                }
                JobItemList.selectRange(lastClickedItemId, self.jobItem.id);
            }
            else if (e.target != self.$checkbox[0]) {
                self.$checkbox.prop('checked', !self.$checkbox.prop('checked'));
            }
            JobItemList.clearLastSelectionState();
            self.$el.toggleClass('clicked');
            if(callbacks.onItemClick) callbacks.onItemClick(self.jobItem.id);
        });
        this.$previewBtn.off().on('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            if(callbacks.onPreview) callbacks.onPreview(self.jobItem.fileId);
        });
        this.$removeBtn.off().on('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            if(callbacks.onRemove) callbacks.onRemove([self.jobItem.id]);
        });
        this.$copyBtn.off().on('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            if(callbacks.onCopy) callbacks.onCopy(self.jobItem.id);
        });
        // reorder 由 sortable handle
    };

    // 渲染 DOM
    JobItemJqObject.prototype.render = function() {
        var file = this.file;
        this.$el.attr('data-id', this.jobItem.id);
        this.$fileName.text(file.name);
        this.$fileSize.text(file.sizeStr);
        this.$pageCnt.text(file.pageCnt);
        if(!file.viewable) {
            this.$largePreviewBtn.show();
            this.$previewBtn.hide();
        } else {
            this.$previewBtn.show();
            this.$largePreviewBtn.hide();
        }
        this.updateBadge();
        return this.$el;
    };

    JobItemJqObject.prototype.updateBadge = function() {
        if(this.jobItem.hasCustomPages()) {
            this.$badge.show();
            this.$badgeCount.text(this.jobItem.pageSets.length);
        } else {
            this.$badge.hide();
        }
    };

    JobItemJqObject.prototype.isSelected = function() {
        return this.$checkbox.prop('checked');
    };

    JobItemJqObject.prototype.setSelected = function(selected) {
        this.$checkbox.prop('checked', selected);
    };

    JobItemJqObject.prototype.remove = function() {
        this.$el.remove();
    };

    JobItemJqObject.prototype.getElement = function() {
        return this.$el;
    };

    window.JobItemJqObject = JobItemJqObject;
})(); 