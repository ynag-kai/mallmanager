<template>
<el-card class="box-card">
    <!-- 面包屑导航 -->
    <com-breadcrumb level1="权限管理" level2="角色列表"></com-breadcrumb>

    <!-- 添加角色 -->
    <el-button plain class="addbtn" @click="dialogFormVisible=true">添加用户</el-button>
    <!-- 数据表格 -->
    <el-table :data="roles" v-loading="loading">
        <!-- 展开行 -->
        <el-table-column type="expand">
            <template slot-scope="scope">
                <div v-if="scope.row.children.length===0" class="nodata">没有对应权限，请添加</div>
                <!-- 第一级 -->
                <el-row v-for="(item1, index) in scope.row.children" :key="index">
                    <el-col :span="3">
                        <el-tag closable class="tags" @close="handleTagClose(scope.row,item1.id)">
                            {{item1.authName}}
                        </el-tag>
                        <i class="el-icon-arrow-right"></i>
                    </el-col>
                    <el-col :span="21">
                        <!-- 第二级 -->
                        <el-row v-for="(item2, index) in item1.children" :key="index">
                            <el-col :span="3">
                                <el-tag closable type="success" class="tags" @close="handleTagClose(scope.row,item2.id)">
                                    {{item2.authName}}
                                </el-tag>
                                <i class="el-icon-arrow-right"></i>
                            </el-col>
                            <el-col :span="21">
                                <!-- 第三级 -->
                                <el-tag closable type="warning" v-for="(item3, index) in item2.children" :key="index" class="tags" @close="handleTagClose(scope.row,item3.id)">
                                    {{item3.authName}}
                                </el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>

            </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作">
            <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.row.id)"></el-button>
                <el-button size="mini" type="success" icon="el-icon-check" circle plain @click="handleShowRights(scope.row)"></el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 添加用户对话框 -->
    <el-dialog :title="(!formdata.id?'添加':'修改')+'角色'" :visible.sync="dialogFormVisible" width="40%" @closed="handleCloseDialog()">
        <el-form :model="formdata" :rules="rules" ref="ruleRoleForm">
            <el-form-item label="角色名称" label-width="120px" prop="roleName">
                <el-input v-model="formdata.roleName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" label-width="120px" prop="roleDesc">
                <el-input v-model="formdata.roleDesc" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleEditRole">确定</el-button>
        </div>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogFormVisibleRights" width="40%" @close="handleCloseRights">
        <!-- 树状菜单  show-checkbox 多选框-->
        <el-tree ref="tree" :data="treeRights" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defaultCheckeds" :props="defaultProps">
        </el-tree>

        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisibleRights = false">取 消</el-button>
            <el-button type="primary" @click="handleEditRights">确定</el-button>
        </div>
    </el-dialog>
</el-card>
</template>

<script>
export default {
    data() {
        return {
            loading: false, //加载等待
            roles: [], //角色列表
            dialogFormVisibleRights: false, // 分配权限对话框
            treeRights: [], // 权限树状列表
            defaultCheckeds: [], // 角色已有的权限
            roleId: 0, //角色Id
            dialogFormVisible: false, // 编辑角色对话框
            formdata: {}, // 表单
            defaultProps: {
                id: 'id',
                label: 'authName',
                children: 'children'
            },
            // 验证规则
            rules: {
                roleName: [{
                        required: true,
                        message: '请输入角色名称',
                        trigger: 'blur'
                    },
                    {
                        min: 2,
                        max: 10,
                        message: '长度在 2 到 10 个字符',
                        trigger: 'blur'
                    }
                ],
                roleDesc: [{
                    required: true,
                    message: '请输入角色描述',
                    trigger: 'blur'
                }, ],
            }
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        // 打开编辑对话框
        handleShowEdit(role) {
            // 对象的引用（引用类型，一改都改）
            // ES6中提供对象拷贝(解构)
            this.formdata = {
                ...role
            }
            this.dialogFormVisible = true
        },
        // 编辑角色提交
        handleEditRole() {
            this.$refs['ruleRoleForm'].validate((valid) => {
                if (valid) {
                    // 发送请求
                    let req;
                    if (!this.formdata.id) {  // 添加
                       req = this.$http.post(`roles`, this.formdata)
                    }else{   // 修改
                       req = this.$http.put(`roles/${this.formdata.id}`, this.formdata)
                    }

                   req.then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 201 || status === 200) {
                            this.loadData()
                            this.$message.success(msg)
                            // 关闭对话框
                            this.dialogFormVisible = false
                        }
                    }).catch(res => {})
                } else {
                    return false
                }
            });
        },
        // 关闭编辑角色对话框
        handleCloseDialog() {
            this.formdata = {}
            this.dialogFormVisible = false
            this.$refs['ruleRoleForm'].resetFields()
        },
        // 删除角色
        handleDelete(id) {
            this.$confirm('此操作将永久删除该角色，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http.delete(`roles/${id}`)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            this.loadData()
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }).catch(() => {})
        },
        // 角色授权
        handleEditRights() {
            // 获取选中的权限 =半选+全选
            var arr1 = this.$refs.tree.getHalfCheckedKeys()
            var arr2 = this.$refs.tree.getCheckedKeys()
            // 合并数组
            var arr = [...arr1, ...arr2]
            // 发送请求
            this.$http.post(`roles/${this.roleId}/rights`, {
                    rids: arr.join(',')
                })
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.dialogFormVisibleRights = false
                        this.loadData()
                        this.$message.success(msg)
                    } 
                }).catch(res => {})
        },
        // 打开分配权限对话框
        handleShowRights(role) {
            // 赋值ID
            this.roleId = role.id
            this.dialogFormVisibleRights = true
            // 只需要处理三级
            role.children.forEach(e1 => {
                e1.children.forEach(e2 => {
                    e2.children.forEach(e3 => {
                        this.defaultCheckeds.push(e3.id)
                    })
                })
            })
            // 发送请求获取使用权限信息
            this.$http.get(`rights/tree`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.treeRights = data
                    } 
                }).catch(res => {})

        },
        // 关闭权限对话框
        handleCloseRights() {
            this.defaultCheckeds = [] // 清空默认
        },

        // 删除角色指定的权限
        handleTagClose(role, rightId) {
            this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            role.children = data
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }).catch(() => {})
        },
        // 加载角色列表
        async loadData() {
            this.loading = true
            // 异步请求 
            await this.$http.get(`roles`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.roles = data
                    } 
                }).catch(res => {})
            // 请求结束后 结束loading
            this.loading = false
        }
    },
}
</script>

<style scoped>
.addbtn {
    margin: 20px 0;
}

.tags {
    margin: 5px 0;
}

.nodata {
    text-align: center;
    color: #F56c6c;
}
</style>
