/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.pattern = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    let week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
//在本地存储中存储记事本数据
//参考代码 с https://ru.vuejs.org/v2/examples/todomvc.html
let STORAGE_KEY = 'notepad-vue'; //存储键名称
let notepadStorage = {
    fetch: function () {//检索存储数据
        let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        records.forEach(function (record, index) {
            record.id = index
        });
        notepadStorage.uid = records.length;
        return records
    },
    showAdd: function () {
        let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return (records.length > 0);
    },
    save: function (records) {//将数据保存到本地存储库
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    }
};
let date = new Date();
let time1 = date.pattern("MM-dd hh:mm:ss");

let app = new Vue({
    el: '#app',
    data: {
        title: '记事本',
        message: '',
        records: notepadStorage.fetch(),
        RecordTitle: '' + time1,
        RecordURL: '',
        RecordMessage: '',
        editedRecord: false,
        showDelete: false,
        showAdd: notepadStorage.showAdd(),
    },
    watch: {//观察者 记录中的任何更改都保存
        records: {
            handler: function (records) {
                notepadStorage.save(records);
                this.showAdd = (records.length > 0);
            },
            deep: true
        },
        RecordMessage: {
            handler: function (RecordMessage) {
                // console.log(this.editedRecord);
                let title = this.RecordTitle && this.RecordTitle.trim()
                let message = this.RecordMessage && this.RecordMessage.trim()
                let url = this.RecordURL && this.RecordURL.trim();
                if (this.editedRecord) {
                    this.editedRecord.title = title;
                    this.editedRecord.message = message;

                    this.editedRecord.RecordURL = url;
                }
                else {
                    this.addRecord();
                }
            },
            deep: true
        }
    },
    methods: {
        addRecord: function () {//添加新记录
            let date = new Date();
            let time1 = date.pattern("MM-dd hh:mm:ss");
            id = this.records.push({//每次创建新记录，返回 id
                id: notepadStorage.uid++,
                title: '' + time1,
                message: '',
            });
            if (id > 0) {
                this.editedRecord = this.records[id - 1]; //指向最近的记录
                this.showDelete = true
            }
            this.RecordTitle = '' + time1;
            this.RecordMessage = '';
            this.RecordURL = '';
        },
        editRecord: function (record) {//编辑记录
            this.editedRecord = record;
            this.RecordTitle = record.title;
            this.RecordMessage = record.message;
            this.RecordURL = record.RecordURL;

            this.showDelete = true
        },
        shareRecord: function (record) {//生成分享URL
            this.$http.post('https://elef.top/api.php', {
                type: "txt",
                text: record.message
            }, {
                emulateJSON: true
            }).then(function (response) {
                console.log(response);

                this.RecordURL = response.body.url;
                // response.data中获取ResponseData实体
            }, function (response) {
                // 发生错误
            });
            //this.RecordURL = "asdfasdfds";
            //this.showDelete = true
        },
        /*
            保存记录.
        */
        saveRecord: function (record) {
            let title = this.RecordTitle && this.RecordTitle.trim();
            let message = this.RecordMessage && this.RecordMessage.trim();
            let url = this.RecordURL && this.RecordURL.trim();
            if (record) {
                record.title = title;
                record.message = message;
                record.RecordURL = url;

            } else {
                id = this.records.push({
                    id: notepadStorage.uid++,
                    title: title,
                    message: message,
                    RecordURL: url
                });
                if (id > 0) {
                    this.editedRecord = this.records[id - 1]//指向最新的记录
                    this.showDelete = true
                }
            }
        },
        deleteRecord: function (record) {
            let date = new Date();
            let time1 = date.pattern("MM-dd hh:mm:ss");

            this.records.splice(this.records.indexOf(record), 1);
            this.RecordTitle = '' + time1;
            this.RecordMessage = '';
            this.RecordURL = '';
            this.editedRecord = false;
            this.showDelete = false;
        },
    }
});