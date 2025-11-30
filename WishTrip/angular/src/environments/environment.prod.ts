import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

const oAuthConfig = {
  issuer: 'https://localhost:44337/',
  redirectUri: baseUrl,
  clientId: 'WishTrip_App',
  responseType: 'code',
  scope: 'offline_access WishTrip',
  requireHttps: true,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'WishTrip',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'https://localhost:44337',
      rootNamespace: 'WishTrip',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
  remoteEnv: {
    url: '/getEnvConfig',
    mergeStrategy: 'deepmerge'
  }
} as Environment;
