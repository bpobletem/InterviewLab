import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config: Config = {
  // Indicar a Jest dónde buscar las pruebas
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],

  // Configurar el entorno de prueba
  testEnvironment: 'node',

  // Transformar archivos TypeScript usando ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Rutas para resolver módulos
  moduleDirectories: ['node_modules', 'src'],

  // Mapeo de módulos para resolver importaciones como '@/...'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ignorar ciertas carpetas
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Configurar setup para Jest
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Otras configuraciones
  verbose: true,
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)