import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

async function minify() {
  await build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2020',
    outfile: 'dist/worker.js',
    treeShaking: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    legalComments: 'none',
    charset: 'utf8',
    sourcemap: false,
  });

  // 读取生成的文件并进行额外的压缩
  let code = readFileSync('dist/worker.js', 'utf8');
  
  // 移除所有注释
  code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  
  // 移除多余的空白
  code = code.replace(/\s+/g, ' ').trim();
  
  // 保存压缩后的代码
  writeFileSync('dist/worker.js', code, 'utf8');
}

minify().catch(console.error); 