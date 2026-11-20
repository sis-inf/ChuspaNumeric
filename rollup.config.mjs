export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/chuspanumeric.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/chuspanumeric.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
};
