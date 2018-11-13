"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
const castle_vuex_1 = require("castle-vuex");
const castle_hotkey_1 = require("castle-hotkey");
const castle_xlsx_1 = require("castle-xlsx");
const lodash_1 = require("lodash");
class ModalConfig {
    constructor() {
        this.Show = false;
        this.Type = "";
        this.Data = {};
    }
}
exports.ModalConfig = ModalConfig;
class SelectConfig {
    constructor() {
        this.All = false;
        this.SelectedIDs = [];
        this.CloseAlert = "";
    }
}
exports.SelectConfig = SelectConfig;
class ImportConfig {
    constructor() {
        this.Map = {};
        this.XLSXData = [];
        this.SheetName = "";
        this.Show = false;
    }
}
exports.ImportConfig = ImportConfig;
class ExportConfig {
    constructor() {
        this.Map = {};
        this.XLSXData = [];
        this.SheetName = "";
    }
}
exports.ExportConfig = ExportConfig;
class SearchConfig {
}
exports.SearchConfig = SearchConfig;
class VuexConfig {
    constructor() {
        this.Code = "";
        this.PK = "";
        this.API = {};
    }
}
exports.VuexConfig = VuexConfig;
class OperateConfig {
    constructor() {
        this.Del = false;
        this.Add = false;
        this.Edit = false;
    }
}
exports.OperateConfig = OperateConfig;
class TableConfig {
    constructor() {
        this.Index = -1;
    }
}
exports.TableConfig = TableConfig;
class VueList extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.Where = new castle_vuex_1.SearchWhere;
        this.Select = new SelectConfig;
        this.Modal = new ModalConfig;
        this.Import = new ImportConfig;
        this.Export = new ExportConfig;
        this.Vuex = new VuexConfig;
        this.Operate = new OperateConfig;
        this.Table = new TableConfig;
    }
    get Result() {
        return this.$store.getters[`G_${this.Vuex.Code.toUpperCase()}_RESULT`];
    }
    get canAdd() {
        return this.Operate.Add;
    }
    get canDel() {
        return this.Operate.Del;
    }
    get canEdit() {
        return this.Operate.Edit;
    }
    page() {
        this.Table.Index = -1;
        this.Select.SelectedIDs = [];
        this.Select.All = false;
        this.search();
    }
    watchKeyword(n) {
    }
    selectAll() {
        if (this.Select.All) {
            this.Select.SelectedIDs = [];
            this.Result.L.forEach((e) => {
                this.Select.SelectedIDs.push(e[this.Vuex.PK]);
            });
        }
        else {
            if (this.Select.SelectedIDs.length == this.Result.L.length)
                this.Select.SelectedIDs = [];
        }
    }
    selectOne(v) {
        if (v[this.Vuex.PK]) {
            let i = this.Select.SelectedIDs.indexOf(v[this.Vuex.PK]);
            if (i > -1) {
                this.Select.SelectedIDs.splice(i, 1);
                if (this.Select.All)
                    this.Select.All = false;
            }
            else {
                this.Select.SelectedIDs.push(v[this.Vuex.PK]);
                if (this.Select.SelectedIDs.length == this.Result.L.length)
                    this.Select.All = true;
            }
        }
    }
    selectFile() {
        let input = this.$refs.import;
        if (input) {
            input.value = "";
            input.click();
        }
        else {
            this.$msg('未设定ref=import');
        }
    }
    importXLSX() {
        let input = this.$refs.import;
        if (!input) {
            return;
        }
        let files = input.files;
        if (files && files.length > 0) {
            if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ==
                files[0].type) {
                this.$msg('正在读取文件，请稍后..');
                castle_xlsx_1.readAsJSON(files[0], (d) => {
                    let sheets = Object.keys(d);
                    if (sheets.length == 0) {
                        this.$msg('所选文件不正确，没有表格数据，请重新选择');
                    }
                    else {
                        this.Import.XLSXData = d[this.Import.SheetName ? this.Import.SheetName : sheets[0]];
                        this.Import.Show = true;
                    }
                });
            }
            else {
                this.$msg('所选文件格式不正确，请重新选择');
            }
        }
    }
    async exportXLSX(FileName) {
        if (!FileName) {
            this.$msg('请传入文件名');
            return;
        }
        let ExcelExport = [];
        if ('function' === typeof this.Export.Map) {
            ExcelExport = await this.Export.Map();
        }
        else {
            let Where = lodash_1.cloneDeep(this.Where);
            Where.N = 999999;
            let res = await this.Vuex.API.search(this.Where);
            let MapFrom = Object.keys(this.Export.Map);
            let i = this.Export.Map;
            res.L.forEach((row) => {
                let ExcelObject = {};
                MapFrom.forEach((key) => {
                    ExcelObject[key] = row[i[key]] ? row[i[key]] : '';
                });
                ExcelExport.push(ExcelObject);
            });
        }
        castle_xlsx_1.writeFileFromJSON({
            Data: ExcelExport
        }, `${FileName}.xlsx`);
    }
    downloadExcel(FileName) {
        if (!FileName) {
            this.$msg('请输入导出文件名');
            return;
        }
        if ('function' === typeof this.Import.Map) {
            this.Import.Map();
        }
        else {
            let Template = {};
            for (let i in Object.keys(this.Import.Map)) {
                Template[Object.keys(this.Import.Map)[i]] = "";
            }
            castle_xlsx_1.writeFileFromJSON({
                Map: [
                    Template
                ]
            }, `${FileName}.xlsx`);
        }
    }
    add(v) {
        this.Modal.Type = 'add';
        this.Modal.Data = lodash_1.cloneDeep(v);
        this.Modal.Show = true;
    }
    edit(v) {
        this.Modal.Type = 'edit';
        this.Modal.Data = lodash_1.cloneDeep(v);
        this.Modal.Show = true;
    }
    del(v) {
        let index = this.$confirm("确定要删除吗?", () => {
            this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_DEL`, {
                Data: v,
                Success: () => {
                    this.$msg("删除成功");
                },
                Error: (e) => {
                    this.$msg(e.message || "删除失败");
                }
            });
        }, () => { }, {
            icon: 3,
            title: "信息"
        });
        this.Select.CloseAlert = index;
    }
    async delW() {
        if (this.Select.SelectedIDs.length > 0 && 'function' === typeof this.Select.CloseAlert) {
            this.Where.W[this.Vuex.PK] = {
                in: this.Select.SelectedIDs
            };
            this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_DEL_W`, {
                Data: this.Where.W,
                Success: () => {
                    this.Select.All = false;
                    this.$msg('删除成功');
                },
                Error: (e) => {
                    this.$msg(e.message || '删除失败');
                }
            });
        }
    }
    batchDel() {
        if (this.Select.SelectedIDs.length == 0) {
            this.$msg("请选择需要删除的数据");
            return;
        }
        let index = this.$confirm("确定要删除吗?", () => {
            this.delW();
        }, () => { }, {
            icon: 3,
            title: "信息"
        });
        this.Select.CloseAlert = index;
    }
    search() {
        this.$store.commit(`M_${this.Vuex.Code.toUpperCase()}_WHERE`, this.Where);
        this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_SEARCH`);
    }
    isSelectAll() {
        this.Select.All == true ? this.Select.All = false : this.Select.All = true;
    }
    previous() {
        if (this.Where.P > 1)
            this.Where.P--;
        else
            this.Where.P = Math.ceil(this.Result.T / this.Where.N);
        this.Table.Index = -1;
    }
    next() {
        if (this.Where.P < Math.ceil(this.Result.T / this.Where.N))
            this.Where.P++;
        else
            this.Where.P = 1;
        this.Table.Index = -1;
    }
    up() {
        if (this.Table.Index == -1)
            this.Table.Index = this.Result.L.length - 1;
        else
            this.Table.Index--;
    }
    down() {
        if (this.Table.Index < this.Result.L.length - 1)
            this.Table.Index++;
        else
            this.Table.Index = -1;
    }
    space() {
        if (this.Table.Index < 0)
            return;
        this.selectOne(this.Result.L[this.Table.Index]);
    }
    showAddModal() {
        this.add({});
    }
    showEditModal() {
        if (this.Table.Index < 0)
            return;
        this.edit(this.Result.L[this.Table.Index]);
    }
    focus() {
        if (!this.$refs.input) {
            this.$msg('搜索输入框未绑定ref=input');
            return;
        }
        this.$refs.input.focus();
    }
    closeAlert() {
        if (this.Select.CloseAlert) {
            this.Select.CloseAlert();
            this.Select.All = false;
        }
    }
    listenKey() {
        castle_hotkey_1.default.listen("ctrl+a,del,enter,esc,left,right,up,down,f1,f2,space", "List", (event, handler) => {
            switch (handler.key) {
                case "ctrl+a":
                    this.isSelectAll();
                    break;
                case "del":
                    this.batchDel();
                    break;
                case "enter":
                    this.delW();
                    break;
                case "esc":
                    this.closeAlert();
                    break;
                case "left":
                    this.previous();
                    break;
                case "right":
                    this.next();
                    break;
                case "up":
                    this.up();
                    break;
                case "down":
                    this.down();
                    break;
                case "f2":
                    this.showEditModal();
                    break;
                case "f1":
                    this.showAddModal();
                    break;
                case "space":
                    this.space();
                    break;
            }
        });
    }
    removeAll() {
        castle_hotkey_1.default.removeAll();
    }
    async _mounted(...Methods) {
        await this.search();
        Methods.forEach(async (methods) => {
            await methods();
        });
    }
    _created(...Methods) {
        this.listenKey();
        Methods.forEach(async (methods) => {
            await methods();
        });
    }
    _beforeDestroy(...Methods) {
        this.removeAll();
    }
}
__decorate([
    vue_property_decorator_1.Watch("Where.P")
], VueList.prototype, "page", null);
__decorate([
    vue_property_decorator_1.Watch("Where.Keyword")
], VueList.prototype, "watchKeyword", null);
__decorate([
    vue_property_decorator_1.Watch('Select.All')
], VueList.prototype, "selectAll", null);
exports.default = VueList;
class VueEdit extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.EditData = {};
        this.Rules = {};
        this.Options = {
            area: ["80%", "80%"],
            maxmin: true,
            btn: ["确定", "取消"],
            yes: () => {
                this.submit();
            },
            btn2: () => {
                this.cancel();
            }
        };
    }
    watchValue(n) {
        if (n) {
            this.EditData = lodash_1.cloneDeep(this.Data);
        }
        else {
        }
    }
    submit() {
        if (this.value) {
            this.Type == "add" ? this.add() : this.edit();
        }
    }
    add() {
        this.$store.dispatch(`A_${this.Code.toUpperCase()}_ADD`, {
            Data: this.EditData,
            Success: () => {
                this.$msg("添加成功");
                this.value = false;
            },
            Error: (e) => {
                this.$msg(e.message || "添加失败");
            }
        });
    }
    edit() {
        this.$store.dispatch(`A_${this.Code.toUpperCase()}_SAVE`, {
            Data: this.EditData,
            Success: () => {
                this.$msg("修改成功");
                this.value = false;
            },
            Error: (e) => {
                this.$msg(e.message || "修改失败");
            }
        });
    }
    get ShowModal() {
        return this.value;
    }
    set ShowModal(v) {
        this.$emit("input", v);
    }
    cancel() {
        this.value = false;
    }
    listenKey() {
        castle_hotkey_1.default.listen("esc,enter", "Edit", (event, handler) => {
            switch (handler.key) {
                case "esc":
                    this.cancel();
                    break;
                case "enter":
                    this.submit();
                    break;
            }
        });
    }
    removeAll() {
        castle_hotkey_1.default.removeAll();
    }
}
__decorate([
    vue_property_decorator_1.Prop({
        type: Boolean,
        required: true,
        default: false
    })
], VueEdit.prototype, "value", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: String,
        required: true,
        default: ""
    })
], VueEdit.prototype, "Type", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: [Object, Array],
        required: true,
        default: {}
    })
], VueEdit.prototype, "Data", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: String,
        required: true,
        default: ""
    })
], VueEdit.prototype, "Code", void 0);
__decorate([
    vue_property_decorator_1.Watch('value')
], VueEdit.prototype, "watchValue", null);
exports.VueEdit = VueEdit;
class VueImport extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.Success = [];
        this.Error = [];
        this.ExcelImport = [];
        this.Loading = false;
        this.Progress = 0;
        this.Options = {
            area: ["80%", "80%"],
            maxmin: true,
            btn: ["确定", "取消"],
            yes: () => {
                this.submit();
            },
            btn2: () => {
                this.cancel();
            }
        };
    }
    watchValue(n) {
        if (n) {
            if ('function' === typeof this.Map) {
                this.ExcelImport = this.Map();
            }
            else {
                let MapFrom = Object.keys(this.Map);
                this.XlsxData.forEach((row) => {
                    let ExcelObject = {};
                    MapFrom.forEach((key) => {
                        ExcelObject[this.Map[key]] = row[key] ? row[key] : '';
                    });
                    this.ExcelImport.push(ExcelObject);
                });
            }
        }
        else {
            this.Success = [];
            this.Error = [];
            this.ExcelImport = [];
            this.Vuex.API.search();
        }
    }
    get ShowModal() {
        return this.value;
    }
    set ShowModal(v) {
        this.$emit("input", v);
    }
    async submit() {
        if (this.Loading === true) {
            this.$msg("导入中请稍等");
            return;
        }
        this.Success = [];
        this.Error = [];
        this.Loading = true;
        for (let i in this.ExcelImport) {
            try {
                await this.Vuex.API.add(this.ExcelImport[i]);
                this.Success.push(Number(i));
            }
            catch (error) {
                this.Error.push(Number(i));
            }
            this.Progress = this.Success.concat(this.Error).length / this.ExcelImport.length * 100;
        }
        this.$msg("导入完成");
        this.Loading = false;
    }
    cancel() {
        this.value = false;
    }
}
__decorate([
    vue_property_decorator_1.Prop({
        type: Boolean,
        required: true,
        default: false
    })
], VueImport.prototype, "value", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: [Object, Array],
        required: true,
        default: false
    })
], VueImport.prototype, "Map", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: [Object, Array],
        required: true,
        default: []
    })
], VueImport.prototype, "XlsxData", void 0);
__decorate([
    vue_property_decorator_1.Prop({
        type: [Object, Array],
        required: true,
        default: ""
    })
], VueImport.prototype, "Vuex", void 0);
__decorate([
    vue_property_decorator_1.Watch("value")
], VueImport.prototype, "watchValue", null);
exports.VueImport = VueImport;
//# sourceMappingURL=index.js.map