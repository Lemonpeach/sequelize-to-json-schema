module.exports = {
  env: {
    es6: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  plugins: ['jest'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
}
