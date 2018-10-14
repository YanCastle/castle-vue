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

import {
    readAsJSON,
    writeFileFromJSON,
    writeFileFromTable
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
}

export class ImportConfig {
    //导入的标题处理算法
    Map: {
        [index: string]: string | Function
    } = {}
    //导入的数据
    XLSXData: any[] = []
    SheetName: string = ""
    Show: boolean = false
}

export class ExportConfig {
    //导出的标题处理算法
    Map: {
        [index: string]: string | Function
    } = {}
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
    PK: string = "";
}
export class OperateConfig {
    Del: boolean = false
    Add: boolean = false
    Edit: boolean = false
}
declare let require: any
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
    /**
     * 查询结果
     */
    get Result() {
        return this.$store.getters[`G_${this.Vuex.Code.toUpperCase()}_RESULT`]
    }
    /**
     * 翻页
     */
    @Watch("Where.P")
    page() {
        this.Select.SelectedIDs = [];
        this.Select.All = false;
        this.search();
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
            if (this.Select.SelectedIDs.length == this.Where.N) this.Select.SelectedIDs = [];
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
                if (this.Select.SelectedIDs.length == this.Where.N) this.Select.All = true
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
    exportXLSX() {
        //TODO 可能需要导出的范围选择
    }
    /**
     * 下载模板
     */
    downloadTemplate() {
        //TODO 下载模板
    }
    /**
     * 添加
     * @param v 
     */
    add(v: any) {
        this.Modal.Type = 'add';
        this.Modal.Data = clone(v)
        this.Modal.Show = true;
    }
    /**
     * 编辑
     * @param v 
     */
    edit(v: any) {
        this.Modal.Type = 'edit';
        this.Modal.Data = clone(v)
        this.Modal.Show = true;
    }
    /**
     * 删除
     * @param v 
     */
    del(v: any) {
        this.$confirm(
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
    }
    async delW() {
        //TODD 并且删除提示框显示
        if (this.Select.SelectedIDs.length == 0) return
        try {
            //TODO 批量删除逻辑
        } catch (error) {
            this.$msg("删除失败")
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
        this.$confirm(
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
    }
    /**
     * 查询
     */
    search() {
        this.$store.commit(`M_${this.Vuex.Code.toUpperCase()}_WHERE`, this.Where);
        this.$store.dispatch(`A_${this.Vuex.Code.toUpperCase()}_SEARCH`);
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
        else this.Where.P = Math.ceil(this.Result.T / this.Where.N);
    }
    /**
     * right
     * 下一页
     */
    next() {
        if (this.Where.P < Math.ceil(this.Result.T / this.Where.N)) this.Where.P++
        else this.Where.P = 1
    }
}
