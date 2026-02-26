module.exports = {
  appId: 'com.doro.app',
  productName: 'Doro',
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  asar: false,
  files: [
    'dist/**/*',
    'electron-main.cjs',
    'package.json',
    'assets/icon.ico',
    'assets/icon.png',
  ],
  win: {
    target: 'nsis',
    icon: 'build/icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'build/icon.ico',
    uninstallerIcon: 'build/icon.ico',
  },
};

