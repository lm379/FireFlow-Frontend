<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>添加云服务配置</span>
        </div>
      </template>
      <CloudConfigFields v-model="form"
        :providers="providers"
        :regions="regions"
        :service-types="serviceTypes"
        :loading-regions="loadingRegions"
        :loading-service-types="loadingServiceTypes"
        :show-project-id="showProjectId"
        :show-azure-fields="showAzureFields"
        @provider-change="onProviderChange" />
      <div class="form-actions">
        <el-button type="primary" :loading="submitting" @click="onSubmit">保存配置</el-button>
        <el-button :disabled="submitting" @click="onCancel">重置</el-button>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>已保存的云服务配置</span>
        </div>
      </template>
      <el-table :data="configs" style="width: 100%">
        <el-table-column prop="provider" label="云服务商" width="120">
          <template #default="scope">
            {{ getProviderDisplayName(scope.row.provider) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            {{ getServiceTypeDisplayName(scope.row.provider, scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="region" label="区域" width="150" />
        <el-table-column prop="instance_id" label="实例ID" width="180" />
        <el-table-column label="Access Key ID" width="150">
          <template #default="scope">
            {{ scope.row.secret_id ? scope.row.secret_id.substr(0, 8) + '***' : '' }}
          </template>
        </el-table-column>
        <el-table-column label="Project ID/Resource Group" width="180">
          <template #default="scope">
            {{ scope.row.project_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Tenant ID" width="120">
          <template #default="scope">
            {{ scope.row.tenant_id ? scope.row.tenant_id.substr(0, 8) + '***' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Subscription ID" width="140">
          <template #default="scope">
            {{ scope.row.subscription_id ? scope.row.subscription_id.substr(0, 8) + '***' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_enabled ? 'success' : 'danger'">{{ scope.row.is_enabled ? '启用' : '禁用'
              }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="默认" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_default ? 'success' : 'info'">{{ scope.row.is_default ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="CreatedAt" label="创建时间" width="180" :formatter="formatDate" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="scope">
            <el-button size="small" :type="scope.row.is_enabled ? 'warning' : 'success'"
              :loading="togglingIds.has(scope.row.ID)" @click="handleToggle(scope.row)">
              {{ scope.row.is_enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" :disabled="togglingIds.has(scope.row.ID)" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :disabled="togglingIds.has(scope.row.ID)" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="info" :disabled="togglingIds.has(scope.row.ID)" @click="handleTest(scope.row)">测试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑服务器实例" width="min(900px, 94vw)"
      :close-on-click-modal="false" :close-on-press-escape="!editSubmitting" :show-close="false"
      destroy-on-close @closed="resetEdit">
      <CloudConfigFields v-model="editForm"
        :providers="providers"
        :regions="editRegions"
        :service-types="editServiceTypes"
        :loading-regions="editLoadingRegions"
        :loading-service-types="editLoadingServiceTypes"
        :show-project-id="editShowProjectId"
        :show-azure-fields="editShowAzureFields" is-edit
        @provider-change="editor.onProviderChange" />
      <template #footer>
        <el-button :disabled="editSubmitting" @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="saveEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CloudConfig } from '../api'
import CloudConfigFields from './CloudConfigFields.vue'
import { useCloudConfig, getProviderDisplayName, getServiceTypeDisplayName, formatDate } from '../composables/useCloudConfig'

const {
  configs,
  fetchCloudConfigs,
  providers,
  regions,
  serviceTypes,
  loadingRegions,
  loadingServiceTypes,
  form,
  submitting,
  togglingIds,
  showProjectId,
  showAzureFields,
  onProviderChange,
  onSubmit,
  onCancel,
  handleToggle,
  handleDelete,
  handleTest,
  initData,
} = useCloudConfig()

const editor = useCloudConfig({ onSaved: fetchCloudConfigs })
const {
  form: editForm,
  submitting: editSubmitting,
  regions: editRegions,
  serviceTypes: editServiceTypes,
  loadingRegions: editLoadingRegions,
  loadingServiceTypes: editLoadingServiceTypes,
  showProjectId: editShowProjectId,
  showAzureFields: editShowAzureFields,
} = editor
const editDialogVisible = ref(false)

const handleEdit = (row: CloudConfig) => {
  editor.configs.value = configs.value
  editor.handleEdit(row)
  editDialogVisible.value = true
}

const resetEdit = () => {
  if (!editDialogVisible.value) editor.onCancel()
}

const saveEdit = async () => {
  if (await editor.onSubmit()) editDialogVisible.value = false
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.form-actions {
  display: flex;
  gap: 12px;
  margin-left: 140px;
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
