const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = [
  ['node_modules/three/build/three.module.js', 'dist/vendor/three.module.js'],
  ['node_modules/three/build/three.core.js', 'dist/vendor/three.core.js'],
  ['node_modules/three/examples/jsm/loaders/GLTFLoader.js', 'dist/vendor/addons/loaders/GLTFLoader.js'],
  ['node_modules/three/examples/jsm/utils/BufferGeometryUtils.js', 'dist/vendor/addons/utils/BufferGeometryUtils.js'],
  ['node_modules/three/examples/jsm/utils/SkeletonUtils.js', 'dist/vendor/addons/utils/SkeletonUtils.js'],
  ['node_modules/three/LICENSE', 'dist/vendor/THREE-LICENSE.txt'],
  ['node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2', 'dist/assets/ui.woff2'],
];
for (const [input, output] of files) {
  const from = path.join(root, input), to = path.join(root, output);
  if (!fs.existsSync(from)) throw Error(`Missing dependency ${input}. Run npm install first.`);
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.copyFileSync(from, to);
}
// qrcode-generator ships as a plain script; append an ES export so the browser can import it.
const qrSrc = path.join(root, 'node_modules/qrcode-generator/qrcode.js');
if (!fs.existsSync(qrSrc)) throw Error('Missing dependency qrcode-generator. Run npm install first.');
fs.mkdirSync(path.join(root, 'dist/vendor'), {recursive: true});
fs.writeFileSync(path.join(root, 'dist/vendor/qrcode.js'), fs.readFileSync(qrSrc, 'utf8') + '\nexport default qrcode;\n');
console.log('Prepared 3D modules and local font in dist/.');
