// vitest-setup.ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Happy DOM gère déjà beaucoup de choses, mais on garde quelques mocks utiles

// Mock pour getClientRects (Happy DOM l'implémente peut-être déjà)
if (!Element.prototype.getClientRects) {
  Element.prototype.getClientRects = vi.fn(() => ({
    item: () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    }),
    length: 1,
    [Symbol.iterator]: function* () {
      yield {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      };
    },
  }));
}

// Mock pour getSelection si besoin
if (!window.getSelection) {
  window.getSelection = vi.fn(() => ({
    getRangeAt: vi.fn(),
    addRange: vi.fn(),
    removeAllRanges: vi.fn(),
    // ... autres méthodes
  }));
}

console.log('✅ Vitest setup with Happy DOM loaded');