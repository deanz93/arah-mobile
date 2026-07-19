module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '@react-native|' +
      'react-native|' +
      '@maplibre/maplibre-react-native|' +
      '@react-native-firebase|' +
      '@react-native-google-signin|' +
      '@react-native-community|' +
      '@react-navigation' +
    ')/)',
  ],
  setupFilesAfterFramework: ['@testing-library/react-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageReporters: ['text', 'lcov'],
}
