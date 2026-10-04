<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>添加新规则</span>
        </div>
      </template>
      <FirewallRuleFields v-model="form"
        :cloud-config-options="cloudConfigOptions"
        :selected-cloud-config="selectedCloudConfig"
        :is-port-disabled="isPortDisabled"
        :port-count="portCount"
        :selected-config-display-name="getSelectedConfigDisplayName()" />
      <div class="form-actions">
        <el-button type="primary" :loading="submitting" @click="onSubmit">添加规则</el-button>
        <el-button :disabled="submitting" @click="onCancel">重置</el-button>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>规则列表</span>
        </div>
      </template>
      <el-table :data="rules" style="width: 100%">
        <el-table-column prop="remark" label="备注" width="120" />
        <el-table-column prop="provider" label="云服务商" width="180">
          <template #default="scope">
            {{ getFullProviderDisplayName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="instance_id" label="实例ID" width="180" />
        <el-table-column prop="port" label="端口" width="120" />
        <el-table-column prop="protocol" label="协议" width="100" />
        <el-table-column prop="last_ip" label="当前IP" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">{{ scope.row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="UpdatedAt" label="最后更新" width="180" :formatter="formatDate" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="scope">
            <el-button size="small" :type="scope.row.enabled ? 'warning' : 'success'"
              :loading="togglingIds.has(scope.row.ID)" @click="handleToggle(scope.row)">
              {{ scope.row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" :disabled="togglingIds.has(scope.row.ID)" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :disabled="togglingIds.has(scope.row.ID)" @click="handleDelete(scope.row)">删除</el-button>
            <el-tooltip content="规则已禁用，请先启用后再执行更新" :disabled="scope.row.enabled">
              <span class="execute-action">
                <el-button size="small" type="success" :disabled="!scope.row.enabled || togglingIds.has(scope.row.ID)" @click="handleExecute(scope.row)">执行</el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑防火墙规则" width="min(900px, 94vw)"
      :close-on-click-modal="false" :close-on-press-escape="!editSubmitting" :show-close="false"
      destroy-on-close @closed="resetEdit">
      <FirewallRuleFields v-model="editForm" is-edit
        :cloud-config-options="cloudConfigOptions"
        :selected-cloud-config="editSelectedCloudConfig"
        :is-port-disabled="editIsPortDisabled"
        :port-count="editPortCount"
        :selected-config-display-name="editor.getSelectedConfigDisplayName()" />
      <template #footer>
        <el-button :disabled="editSubmitting" @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="saveEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FirewallRule } from '../api'
import FirewallRuleFields from './FirewallRuleFields.vue'
import { useFirewallRules } from '../composables/useFirewallRules'
import { formatDateTime } from '../utils/common'
import '../styles/components/firewall-rules.css'

const {
  rules,
  cloudConfigs,
  fetchRules,
  cloudConfigOptions,
  form,
  submitting,
  togglingIds,
  isPortDisabled,
  portCount,
  selectedCloudConfig,
  onSubmit,
  onCancel,
  handleToggle,
  handleDelete,
  handleExecute,
  initData,
  getFullProviderDisplayName,
  getSelectedConfigDisplayName,
} = useFirewallRules()

const editor = useFirewallRules({ onSaved: fetchRules })
const {
  form: editForm,
  submitting: editSubmitting,
  selectedCloudConfig: editSelectedCloudConfig,
  isPortDisabled: editIsPortDisabled,
  portCount: editPortCount,
} = editor
const editDialogVisible = ref(false)

const handleEdit = (row: FirewallRule) => {
  editor.rules.value = rules.value
  editor.cloudConfigs.value = cloudConfigs.value
  editor.cloudConfigOptions.value = cloudConfigOptions.value
  editor.handleEdit(row)
  editDialogVisible.value = true
}

const resetEdit = () => {
  if (!editDialogVisible.value) editor.onCancel()
}

const saveEdit = async () => {
  if (await editor.onSubmit()) editDialogVisible.value = false
}

const formatDate = (_row: any, _column: any, cellValue: string) => {
  return formatDateTime(cellValue)
}

onMounted(() => {
  initData()
});
</script>

<style scoped>
.execute-action {
  display: inline-block;
  margin-left: 12px;
}
.form-actions {
  display: flex;
  gap: 12px;
  margin-left: 120px;
}
.form-actions .el-button + .el-button {
  margin-left: 0;
}
@media (max-width: 600px) {
  .form-actions {
    margin-left: 0;
  }
}
</style>
