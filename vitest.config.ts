import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    /**
     * `restoreMocks` must stay disabled.
     *
     * In Vitest 5, `restoreAllMocks()` deletes the mock's own control
     * methods (`mockReset`, `mockResolvedValue`, …) from the mock function
     * itself rather than merely resetting its state. Any suite that then
     * calls `mockedApi.someMethod.mockReset()` in `beforeEach` throws
     * "mockReset is not a function".
     *
     * The suites here reset their mocks explicitly in `beforeEach`, so
     * automatic restoring is unnecessary.
     */
    restoreMocks: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
