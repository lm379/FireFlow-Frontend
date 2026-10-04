<template>
  <el-form :model="form" label-width="140px">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="云服务商 *">
          <el-select v-model="form.provider" placeholder="请选择云服务商" @change="emit('providerChange', $event)" style="width: 100%;">
            <el-option v-for="item in providers" :key="item" :label="getProviderDisplayName(item)"
              :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="区域 *">
          <el-select v-model="form.region" placeholder="请选择区域" filterable :loading="loadingRegions"
            style="width: 100%;">
            <el-option v-for="item in regions" :key="item.code" :label="`${item.name} (${item.code})`"
              :value="item.code"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="类型 *">
          <el-select v-model="form.type" placeholder="请选择服务器类型" filterable :loading="loadingServiceTypes"
            style="width: 100%;">
            <el-option v-for="item in serviceTypes" :key="item.Value" :label="`${item.DisplayName} (${item.Name})`"
              :value="item.Value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="实例ID/安全组ID *">
          <el-input v-model="form.instance_id" placeholder="云服务器实例ID/安全组ID"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="配置描述">
          <el-input v-model="form.description" placeholder="配置用途描述"></el-input>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" v-if="showProjectId">
        <el-form-item label="Project ID *">
          <el-input v-model="form.project_id" placeholder="华为云项目ID"></el-input>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" v-if="showAzureFields">
        <el-form-item label="Resource Group *">
          <el-input v-model="form.project_id" placeholder="Azure资源组名称"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-if="showAzureFields">
      <el-col :xs="24" :sm="12">
        <el-form-item label="Tenant ID *">
          <el-input v-model="form.tenant_id" placeholder="Azure租户ID"></el-input>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="Subscription ID *">
          <el-input v-model="form.subscription_id" placeholder="Azure订阅ID"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="AK *">
          <el-input v-model="form.secret_id" :placeholder="isEdit ? '留空保留原 AK；输入新值可替换' : '访问密钥ID/Client ID'"></el-input>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="SK *">
          <el-input v-model="form.secret_key" type="password" :placeholder="isEdit ? '留空保留原 SK；输入新值可替换' : '访问密钥Secret/Client Secret'"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="设为默认配置">
          <el-select v-model="form.is_default" style="width: 100%;">
            <el-option label="否" :value="false"></el-option>
            <el-option label="是" :value="true"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="启用状态">
          <el-select v-model="form.is_enabled" style="width: 100%;">
            <el-option label="启用" :value="true"></el-option>
            <el-option label="禁用" :value="false"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import type { CloudConfigForm, Region } from '../composables/useCloudConfig'
import { getProviderDisplayName } from '../constants/providers'
import type { ServiceType } from '../constants/serviceTypes'
const form = defineModel<CloudConfigForm>({ required: true })
defineProps<{
  providers: string[]
  regions: Region[]
  serviceTypes: ServiceType[]
  loadingRegions: boolean
  loadingServiceTypes: boolean
  showProjectId: boolean
  showAzureFields: boolean
  isEdit?: boolean
}>()
const emit = defineEmits<{ providerChange: [provider: string] }>()
</script>
