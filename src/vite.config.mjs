import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNgDocAngularPlugins } from '@ng-doc/builder/generator/vite/angular/index.js';
import {
  createNgDocApplicationPlugin,
  createNgDocVitePlugin
} from '@ng-doc/builder/generator/vite/index.js';

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const getWorkspacePath = (file) => path.join(workspaceRoot, file);
const tsconfig = getWorkspacePath('src/tsconfig.app.json');

export default () => ({
  root: getWorkspacePath('src'),
  // Relative URLs let the hash-routed docs work under any path, e.g. the GitHub Pages project path
  base: './',
  publicDir: false,
  plugins: [
    createNgDocApplicationPlugin({
      workspaceRoot,
      browser: 'src/main.ts',
      polyfills: ['zone.js'],
      styles: ['node_modules/@ng-doc/app/styles/global.css', 'src/styles.css'],
      assets: [
        {
          glob: '**/*',
          input: 'node_modules/@ng-doc/ui-kit/assets',
          output: 'assets/ng-doc/ui-kit'
        },
        'src/favicon.ico',
        'src/assets'
      ]
    }),
    createNgDocVitePlugin({
      analogLiveReload: true,
      angularPlugins: createNgDocAngularPlugins({ tsconfig, workspaceRoot }),
      angularComponentProbe: getWorkspacePath('src/app/app.component.ts'),
      generator: {
        projectId: 'docs',
        workspaceRoot,
        configFile: getWorkspacePath('src/ng-doc.config.ts'),
        defaults: {
          docsRoot: getWorkspacePath('src'),
          tsConfig: tsconfig,
          outputRoot: getWorkspacePath('ng-doc/docs'),
          cacheRoot: getWorkspacePath('.cache/ng-doc/docs')
        }
      }
    }),
    {
      // The ng-doc dev server never binds Vite's CLI shortcuts on its own
      name: 'cli-shortcuts',
      apply: 'serve',
      configureServer(server) {
        server.httpServer?.once('listening', () => server.bindCLIShortcuts({ print: true }));
      }
    }
  ],
  build: {
    outDir: getWorkspacePath('dist/docs/browser'),
    emptyOutDir: true
  }
});
