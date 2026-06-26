param location string = resourceGroup().location
param appName string = 'tms'
param uniqueSuffix string = uniqueString(resourceGroup().id)

param mysqlAdminUser string = 'tmsadmin'
@secure()
param mysqlAdminPassword string

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01-preview' = {
  name: '${appName}acr${uniqueSuffix}'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Azure MySQL Flexible Server
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-30' = {
  name: '${appName}-mysql-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: mysqlAdminUser
    administratorLoginPassword: mysqlAdminPassword
    version: '8.0.21'
  }
}

resource mysqlFirewall 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-06-30' = {
  parent: mysqlServer
  name: 'AllowAllAzureServicesAndIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-30' = {
  parent: mysqlServer
  name: 'tms_db'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${appName}-logs-${uniqueSuffix}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

// Container Apps Environment
resource acaEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${appName}-env-${uniqueSuffix}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Azure Communication Services (Email)
resource communicationService 'Microsoft.Communication/communicationServices@2023-03-31' = {
  name: '${appName}-acs-${uniqueSuffix}'
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
}

resource emailService 'Microsoft.Communication/emailServices@2023-03-31' = {
  name: '${appName}-email-${uniqueSuffix}'
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
}

resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-03-31' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
    userEngagementTracking: 'Disabled'
  }
}

output acrLoginServer string = acr.properties.loginServer
output acrUsername string = acr.name
output acrPassword string = acr.listCredentials().passwords[0].value
output mysqlFqdn string = mysqlServer.properties.fullyQualifiedDomainName
output acsConnectionString string = communicationService.listKeys().primaryConnectionString
output emailDomainFromAddress string = emailDomain.properties.fromSenderDomain
