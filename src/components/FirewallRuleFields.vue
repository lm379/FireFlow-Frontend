<template>
  <el-form :model="form" label-width="120px">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="规则备注 *">
          <el-input v-model="form.remark" placeholder="例如：办公网络SSH访问"></el-input>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="云服务配置 *">
          <el-select v-model="form.cloud_config_id" placeholder="请选择已配置的云服务" style="width: 100%;">
            <el-option v-for="item in cloudConfigOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="端口号 *">
          <el-input v-model="form.port" :disabled="isPortDisabled" placeholder="例如：22, 80, 443, 8000-8080, ALL"></el-input>
          <div v-if="form.port.includes(',') && selectedCloudConfig" style="color: #909399; font-size: 12px; line-height: 1.5;">
            <span v-if="selectedCloudConfig.provider === 'HuaweiCloud'" style="color: #67C23A;">
              华为云ECS/Flexus均支持在一条规则中配置多个端口
            </span>
            <span v-else-if="selectedCloudConfig.provider === 'Aliyun' && Number(selectedCloudConfig.type) === 1" style="color: #67C23A;">
              阿里云轻量应用服务器支持在一条规则中配置多个端口
            </span>
            <span v-else style="color: #E6A23C;">
              <template v-if="isEdit">{{ selectedConfigDisplayName }}不支持多端口，如需多个端口请分别添加规则</template>
              <template v-else>{{ selectedConfigDisplayName }}不支持多端口，将自动创建 {{ portCount }} 条独立规则</template>
            </span>
          </div>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="协议类型 *">
          <el-select v-model="form.protocol" style="width: 100%;">
            <el-option label="TCP" value="TCP"></el-option>
            <el-option label="UDP" value="UDP"></el-option>
            <el-option label="ICMP" value="ICMP"></el-option>
            <el-option label="ALL" value="ALL"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <el-form-item label="启用状态">
          <el-select v-model="form.enabled" style="width: 100%;">
            <el-option label="启用" :value="true"></el-option>
            <el-option label="禁用" :value="false"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import type { FirewallRuleForm, CloudConfigOption } from '../composables/useFirewallRules'
import type { CloudConfig } from '../api'
const form = defineModel<FirewallRuleForm>({ required: true })
defineProps<{
  cloudConfigOptions: CloudConfigOption[]
  selectedCloudConfig?: CloudConfig | null
  isPortDisabled: boolean
  portCount: number
  selectedConfigDisplayName: string
  isEdit?: boolean
}>()
</script>
