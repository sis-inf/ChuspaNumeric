export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/chuspanumeric.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/chuspanumeric.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ]
};
