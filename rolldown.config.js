import path from 'node:path'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rolldown'

const projectRootDir = path.resolve(__dirname)

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    alias({
      entries: [
        { find: '~', replacement: path.resolve(projectRootDir, 'src') },
      ],
    }),
  ],
})
