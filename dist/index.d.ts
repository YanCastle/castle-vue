import { Vue } from "vue-property-decorator";
import { SearchWhere } from "castle-vuex";
export declare class ModalConfig {
    Show: boolean;
    Type: string;
    Data: any;
}
export declare class SelectConfig {
    All: boolean;
    SelectedIDs: string[];
    CloseAlert: any;
}
export declare class ImportConfig {
    Map: {
        [index: string]: string;
    } | Function;
    XLSXData: any[];
    SheetName: string;
    Show: boolean;
}
export declare class ExportConfig {
    Map: {
        [index: string]: string;
    } | Function;
    XLSXData: any[];
    SheetName: string;
}
export declare class SearchConfig {
}
export declare class VuexConfig {
    Code: string;
    PK: string;
    API: any;
}
export declare class OperateConfig {
    Del: boolean;
    Add: boolean;
    Edit: boolean;
}
export declare class TableConfig {
    Index: number;
}
export default class VueList extends Vue {
    Where: SearchWhere;
    Select: SelectConfig;
    Modal: ModalConfig;
    Import: ImportConfig;
    Export: ExportConfig;
    Vuex: VuexConfig;
    Operate: OperateConfig;
    Table: TableConfig;
    readonly Result: any;
    readonly canAdd: boolean;
    readonly canDel: boolean;
    readonly canEdit: boolean;
    page(): void;
    watchKeyword(): void;
    selectAll(): void;
    selectOne(v: any): void;
    selectFile(): void;
    importXLSX(): void;
    exportXLSX(FileName: string): Promise<void>;
    downloadExcel(FileName: String): void;
    add(v: any): void;
    edit(v: any): void;
    del(v: any): void;
    delW(): Promise<void>;
    batchDel(): void;
    search(): void;
    isSelectAll(): void;
    previous(): void;
    next(): void;
    up(): void;
    down(): void;
    space(): void;
    showAddModal(v?: any): void;
    showEditModal(): void;
    focus(): void;
    closeAlert(): void;
    listenKey(): void;
    removeAll(): void;
    _mounted(...Methods: Function[]): Promise<void>;
    _created(...Methods: Function[]): void;
    _beforeDestroy(...Methods: Function[]): void;
}
export interface OptionsConfig {
    area?: string[];
    maxmin?: boolean;
    btn?: string[];
    yes?: Function;
    btn2?: Function;
}
export declare class VueEdit extends Vue {
    EditData: any;
    Rules: object;
    value: any;
    Type: any;
    Data: any;
    Code: any;
    watchValue(n: boolean): void;
    Options: OptionsConfig;
    submit(): void;
    add(): void;
    edit(): void;
    ShowModal: boolean;
    cancel(): void;
    listenKey(): void;
    removeAll(): void;
}
export declare class VueImport extends Vue {
    Success: number[];
    Error: number[];
    ExcelImport: any;
    Loading: boolean;
    Progress: number;
    value: any;
    Map: any;
    XlsxData: any;
    Vuex: any;
    watchValue(n: boolean): void;
    ShowModal: boolean;
    Options: OptionsConfig;
    submit(): Promise<void>;
    cancel(): void;
}
