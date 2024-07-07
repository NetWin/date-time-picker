import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'DateTimePicker',
      route: '',
      include: 'projects/picker/src/public_api.ts'
    }
  ]
};

export default api;
