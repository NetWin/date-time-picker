import { NgDocApi } from '@ng-doc/core';
import DocsCategory from './ng-doc.category';

const ApiReference: NgDocApi = {
  title: 'API Reference',
  order: 1,
  category: DocsCategory,
  scopes: [
    {
      name: 'DateTimePicker',
      include: 'projects/picker/src/**/*.ts',
      exclude: 'projects/picker/src/**/*.spec.ts',
      route: 'date-time-picker'
    }
  ]
};

export default ApiReference;
