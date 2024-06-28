import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'my-library-name',
      route: 'my-library',
      include: 'projects/picker/src/**/*.ts',
      exclude: 'projects/picker/src/**/*.spec.ts'
    },
  ],
};

export default api;
