import {
    Component,
    Prop,
    Model,
    Watch,
    Emit,
    Provide,
    Vue
} from "vue-property-decorator";
import {
    SearchWhere
} from "castle-vuex"

import hotkey from 'castle-hotkey'

import {
    readAsJSON,
    writeFileFromJSON,
} from 'castle-xlsx'

import {
    cloneDeep as clone
} from 'lodash'

export class ModalConfig {
    Show: boolean = false;
    Type: string = ""
    Data: any = {}
}
//选择
export class SelectConfig {
    All: boolean = false;
    SelectedIDs: string[] = [];
    CloseAlert: any = ""
}

export class ImportConfig {
    //导入的标题处理算法
    Map: {
        [index: string]: string
    } | Function = {}
    //导入的数据
    XLSXData: any[] = []
    SheetName: string = ""
    Show: boolean = false
}

export class ExportConfig {
    //导出的标题处理算法
    Map: {
        [index: string]: string
    } | Function = {}
    //导出的数据
    XLSXData: any[] = []
    SheetName: string = ""
}
export class SearchConfig {

}
/**
 * Vuex配置信息
 */
export class VuexConfig {
    Code: string = ""
    PK: string = ""
    API: any = {}
}
export class OperateConfig {
    Del: boolean = false
    Add: boolean = false
    Edit: boolean = false
}

/**
 * Table配置信息
 */
export class TableConfig {
    Index: number = -1
}

export default class VueList extends Vue {
    // 条件
    Where: SearchWhere = new SearchWhere
    //选择
    Select: SelectConfig = new SelectConfig
    //模态框
    Modal: ModalConfig = new ModalConfig
    //导入配置
    Import: ImportConfig = new ImportConfig
    //导出配置
    Export: ExportConfig = new ExportConfig
    //Vuex配置
    Vuex: VuexConfig = new VuexConfig
    //操作权限
    Operate: OperateConfig = new OperateConfig
    //table
    Table: TableConfig = new TableConfig
    /**
     * 查询结果
     */
    get Result() {
        return this.$store.getters[`G_${this.Vuex.Code.toUpperCase()}_RESULT`]
    }
    /**
     * 是否能添加
     */
    get canAdd() {
        return this.Operate.Add
    }
    /**
     * 是否能删除
     */
    get canDel() {
        return this.Operate.Del
    }
    /**
     * 是否能修改
     */
    get canEdit() {
        return this.Operate.Edit
    }
    /**
     * 翻页
     */
    @Watch("Where.P")
    page() {
        this.Table.Index = -1
        this.Select.SelectedIDs = []
        this.Select.All = false
        this.search()
    }
    /**
     * 更具关键词模糊查询
     */
    @Watch("Where.Keyword")
    watchKeyword(n: string) {
        //TODO 更具关键词模糊查询
    }
    /**
     * 全选与反选
     */
    @Watch('Select.All')
    selectAll() {
        if (this.Select.All) {
            this.Select.SelectedIDs = []
            this.Result.L.forEach((e: any) => {
                this.Select.SelectedIDs.push(e[this.Vuex.PK])
            });
        } else {
            if (this.Select.SelectedIDs.length == this.Result.L.length) this.Select.SelectedIDs = [];
        }
    }
    /**
     * 选中某个或取消选中
     * @param v 
     */
    selectOne(v: any) {
        if (v[this.Vuex.PK]) {
            let i = this.Select.SelectedIDs.indexOf(v[this.Vuex.PK])
            if (i > -1) {
                this.Select.SelectedIDs.splice(i, 1)
                if (this.Select.All) this.Select.All = false
            } else {
                this.Select.SelectedIDs.push(v[this.Vuex.PK])
                if (this.Select.SelectedIDs.length == this.Result.L.length) this.Select.All = true
            }
        }
    }
    selectFile() {
        let input: any = this.$refs.import;
        if (input) {
            input.value = ""
            input.click()
        } else {
            this.$msg('未设定ref=import')
        }
    }
    /**
     * 导入
     */
    importXLSX() {
        let input: any = this.$refs.import;
        if (!input) {
            return;
        }
        let files = input.files
        if (files && files.length > 0) {
            if (
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ==
                files[0].type) {
                this.$msg('正在读取文件，请稍后..')
                readAsJSON(files[0], (d: any) => {
                    let sheets = Object.keys(d);
                    if (sheets.length == 0) {
                        this.$msg('所选文件不正确，没有表格数据，请重新选择')
                    } else {
                        //只取第一个或者指定的某一个
                        this.Import.XLSXData = d[this.Import.SheetName ? this.Import.SheetName : sheets[0]]
                        //TODO 开始处理数据
                        this.Import.Show = true
                    }
                })
            } else {
                this.$msg('所选文件格式不正确，请重新选择')
            }
        }
    }
    /**
     * 导出
     */
    async exportXLSX(FileName: string) {
        if (!FileName) {
            this.$msg('请传入文件名')
            return
        }
        let ExcelExport: any[] = []
        if ('function' === typeof this.Export.Map) {
            this.Export.Map()
        } else {
            this.Where.N = 999999
            let res = await this.Vuex.API.search(this.Where)
            let MapFrom = Object.keys(this.Export.Map)
            let i: any = this.Export.Map
            res.L.forEach((row: any) => {
                let ExcelObject: any = {}
                MapFrom.forEach((key: string) => {
                    ExcelObject[key] = row[i[key]] ? row[i[key]] : ''
                })
                ExcelExport.push(ExcelObject)
            })
        }
        writeFileFromJSON({
            Data: ExcelExport
        }, `${FileName}.xlsx`)
    }
    /**
     * 下载模板
     */
    downloadExcel(FileName: String) {
        if (!FileName) {
            this.$msg('请输入导出文件名')
            return
        }
        if ('function' === typeof this.Import.Map) {
            this.Import.Map()
        } else {
            let Template: any = {}
            for (let i in Object.keys(this.Import.Map)) {
                Template[Object.keys(this.Import.Map)[i]] = ""
            }
            writeFileFromJSON({
                    Map: [
                        Template
                    ]
                },
                `${FileName}.xlsx`
            );
        }
    }
    /**
     * 添加
     * @param v 
     */
    add(v: any) {
        this.Modal.Type = 'add'
        this.Modal.Data = clone(v)
        this.Modal.Show = true;
    }
    /**
     * 编辑
     * @param v 
     */
    edit(v: any) {
        this.Modal.Type = 'edit'
        this.Modal.Data = clone(v)
        this.Modal.Show = true;
    }
    /**
     * 删除
     * @param v 
     */
    del(v: any) {
        let index = this.$confirm(
            //内容
            "确定要删除吗?",
            //确定按钮
            () => {
                this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_DEL`, {
                    Data: v,
                    Success: () => {
                        this.$msg("删除成功")
                    },
                    Error: () => {
                        this.$msg("删除失败")
                    }
                });
            },
            //取消按钮
            () => {},
            //标题
            {
                icon: 3,
                title: "信息"
            }
        );
        this.Select.CloseAlert = index
    }
    async delW() {
        //TODD 并且删除提示框显示
        if (this.Select.SelectedIDs.length > 0 && 'function'=== typeof this.Select.CloseAlert) {
            this.Where.W[this.Vuex.PK] = { in: this.Select.SelectedIDs
            }
            this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_DEL_W`, {
                Data: this.Where.W,
                Success: () => {
                    this.Select.All = false
                    this.$msg('删除成功')
                },
                Error: () => {
                    this.$msg('删除失败')
                }
            })
        }
    }
    /**
     * 批量删除
     */
    batchDel() {
        if (this.Select.SelectedIDs.length == 0) {
            this.$msg("请选择需要删除的数据")
            return;
        }
        let index = this.$confirm(
            //内容
            "确定要删除吗?",
            //确定按钮
            () => {
                this.delW();
            },
            //取消按钮
            () => {},
            //标题
            {
                icon: 3,
                title: "信息"
            }
        );
        this.Select.CloseAlert = index
    }
    /**
     * 查询
     */
    search() {
        this.$store.commit(`M_${this.Vuex.Code.toUpperCase()}_WHERE`, this.Where)
        this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_SEARCH`)
    }

    //
    //键盘事件
    //

    /**
     * ctrl+a
     * 是否全选
     */
    isSelectAll() {
        this.Select.All == true ? this.Select.All = false : this.Select.All = true
    }

    /**
     * del
     * 弹出确认删除框
     * this.batchDel()
     */

    /**
     * enter
     * 确定删除
     * this.delW()
     */

    /**
     * left
     * 上一页
     */
    previous() {
        if (this.Where.P > 1) this.Where.P--
        else this.Where.P = Math.ceil(this.Result.T / this.Where.N)
        this.Table.Index = -1
    }

    /**
     * right
     * 下一页
     */
    next() {
        if (this.Where.P < Math.ceil(this.Result.T / this.Where.N)) this.Where.P++
        else this.Where.P = 1
        this.Table.Index = -1
    }

    /**
     * up
     * tr Index--
     */
    up() {
        if (this.Table.Index == -1) this.Table.Index = this.Result.L.length - 1
        else this.Table.Index--
    }

    /**
     * down
     * tr Index++
     */
    down() {
        if (this.Table.Index < this.Result.L.length - 1) this.Table.Index++
        else this.Table.Index = -1
    }

    /**
     * space
     * 单选
     */
    space() {
        if (this.Table.Index < 0) return
        this.selectOne(this.Result.L[this.Table.Index])
    }

    /**
     * f1
     * 显示添加模态框
     */
    showAddModal() {
        this.add({})
    }

    /**
     * f2
     * 显示编辑模态框
     */
    showEditModal() {
        if (this.Table.Index < 0) return
        this.edit(this.Result.L[this.Table.Index])
    }

    /**
     * f3
     * 自动获取输入框焦点
     */
    focus() {
        if (!this.$refs.input) {
            this.$msg('搜索输入框未绑定ref=input')
            return
        }
        this.$refs.input.focus()
    }

    /**
     * 关闭删除弹框
     */
    closeAlert() {
        if (this.Select.CloseAlert) {
            this.Select.CloseAlert()
            this.Select.All = false
        }
    }

    /**
     * 监听键盘事件
     */
    listenKey() {
        hotkey.listen("ctrl+a,del,enter,esc,left,right,up,down,f1,f2,space", "List", (event, handler) => {
            switch (handler.key) {
                case "ctrl+a":
                    this.isSelectAll()
                    break;
                case "del":
                    this.batchDel();
                    break;
                case "enter":
                    this.delW()
                    break;
                case "esc":
                    this.closeAlert()
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
        })
    }
    /**
     * 移除所有监听事件
     */
    removeAll() {
        hotkey.removeAll()
    }
    /**
     * 组件被加载的时候触发
     */
    async _mounted(...Methods: Function[]) {
        // if (this.Result.T == 0) {
        await this.search()
        // }
        Methods.forEach(async (methods) => {
            await methods()
        })
    }

    /**
     * 组件被创建的时候触发
     */
    _created(...Methods: Function[]) {
        this.listenKey()
        Methods.forEach(async (methods) => {
            await methods()
        })
    }

    /**
     * 组件被销毁前触发
     */
    _beforeDestroy(...Methods: Function[]) {
        this.removeAll()
    }
}

/**
 * 模态框配置信息
 */
export interface OptionsConfig {
    area ? : string[]
    maxmin ? : boolean
    btn ? : string[]
    yes ? : Function
    btn2 ? : Function
}

export class VueEdit extends Vue {
    //编辑数据
    EditData: any = {}
    //验证规则
    Rules: object = {}
    //模态框显示与否
    @Prop({
        type: Boolean,
        required: true,
        default: false
    })
    value: any
    //模态框类型
    @Prop({
        type: String,
        required: true,
        default: ""
    })
    Type: any;
    //传入的数据
    @Prop({
        type: [Object, Array],
        required: true,
        default: {}
    })
    Data: any;
    //表名
    @Prop({
        type: String,
        required: true,
        default: ""
    })
    Code: any;

    @Watch('value')
    watchValue(n: boolean) {
        if (n) {
            this.EditData = clone(this.Data)
        } else {

        }
    }
    /**
     * 模态框配置
     */
    Options: OptionsConfig = {
        area: ["80%", "80%"],
        maxmin: true,
        btn: ["确定", "取消"],
        yes: () => {
            this.submit()
        },
        btn2: () => {
            this.cancel()
        }
    }
    /**
     * 点击确定按钮
     */
    submit() {
        if(this.value){
            this.Type == "add" ? this.add() : this.edit()
        }
    }
    /**
     * 添加
     */
    add() {
        this.$store.dispatch(`A_${this.Code.toUpperCase()}_ADD`, {
            Data: this.EditData,
            Success: () => {
                this.$msg("添加成功")
                this.value = false
            },
            Error: () => {
                this.$msg("添加失败")
            }
        });
    }
    /**
     * 编辑
     */
    edit() {
        this.$store.dispatch(`A_${this.Code.toUpperCase()}_SAVE`, {
            Data: this.EditData,
            Success: () => {
                this.$msg("修改成功")
                this.value = false;
            },
            Error: () => {
                this.$msg("修改失败")
            }
        });
    }

    get ShowModal() {
        return this.value
    }

    set ShowModal(v: boolean) {
        this.$emit("input", v)
    }
    /**
     * 关闭模态框
     */
    cancel() {
        this.value = false
    }
    /**
     * 注册键盘事件
     */
    listenKey() {
        hotkey.listen("esc,enter", "Edit", (event, handler) => {
            switch (handler.key) {
                case "esc":
                    this.cancel()
                    break
                case "enter":
                    this.submit()
                    break
            }
        });
    }
    /**
     * 移除所有监听事件
     */
    removeAll() {
        hotkey.removeAll()
    }
}


export class VueImport extends Vue {
    Success: number[] = []
    Error: number[] = []
    ExcelImport: any = []
    Loading: boolean = false
    Progress: number = 0
    @Prop({
        type: Boolean,
        required: true,
        default: false
    })
    value: any;
    @Prop({
        type: [Object, Array],
        required: true,
        default: false
    })
    Map: any;
    @Prop({
        type: [Object, Array],
        required: true,
        default: []
    })
    XlsxData: any;
    @Prop({
        type: [Object, Array],
        required: true,
        default: ""
    })
    Vuex: any;
    @Watch("value")
    watchValue(n: boolean) {
        if (n) {
            if ('function' === typeof this.Map) {
                this.ExcelImport = this.Map()
            } else {
                let MapFrom = Object.keys(this.Map)
                this.XlsxData.forEach((row: any) => {
                    let ExcelObject: any = {}
                    MapFrom.forEach((key: string) => {
                        ExcelObject[this.Map[key]] = row[key] ? row[key] : ''
                    })
                    this.ExcelImport.push(ExcelObject)
                })
            }
        } else {
            this.Success = []
            this.Error = []
            this.ExcelImport = []
            this.Vuex.API.search()
        }
    }

    get ShowModal() {
        return this.value;
    }

    set ShowModal(v: boolean) {
        this.$emit("input", v);
    }
    // get Progress() {
    //     let num = this.Success.concat(this.Error).length / this.ExcelImport.length * 100;
    //     return num == 100 ? num : num.toFixed(2);
    // }

    Options: OptionsConfig = {
        area: ["80%", "80%"],
        maxmin: true,
        btn: ["确定", "取消"],
        yes: () => {
            this.submit();
        },
        btn2: () => {
            this.cancel();
        }
    }

    async submit() {
        if (this.Loading === true) {
            this.$msg("导入中请稍等");
            return;
        }
        this.Success = [];
        this.Error = []
        this.Loading = true;
        for (let i in this.ExcelImport) {
            try {
                await this.Vuex.API.add(this.ExcelImport[i]);
                this.Success.push(Number(i));
            } catch (error) {
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