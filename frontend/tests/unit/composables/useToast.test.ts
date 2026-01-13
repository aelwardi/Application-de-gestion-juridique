import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast } from '~/composables/useToast';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('~/stores/toast', () => ({
  useToastStore: vi.fn(() => ({
    addToast: vi.fn((toast) => `toast-${Date.now()}`),
    removeToast: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

describe('useToast', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('devrait créer un toast de succès', () => {
    const toast = useToast();
    const id = toast.success('Succès', 'Opération réussie');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('devrait créer un toast d\'erreur', () => {
    const toast = useToast();
    const id = toast.error('Erreur', 'Une erreur est survenue');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('devrait créer un toast d\'avertissement', () => {
    const toast = useToast();
    const id = toast.warning('Attention', 'Ceci est un avertissement');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('devrait créer un toast d\'information', () => {
    const toast = useToast();
    const id = toast.info('Info', 'Information importante');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('devrait créer un toast avec durée personnalisée', () => {
    const toast = useToast();
    const id = toast.success('Succès', 'Message', 5000);

    expect(id).toBeDefined();
  });

  it('devrait supprimer un toast', () => {
    const toast = useToast();
    const id = toast.success('Test');

    expect(() => toast.remove(id)).not.toThrow();
  });

  it('devrait supprimer tous les toasts', () => {
    const toast = useToast();
    toast.success('Toast 1');
    toast.success('Toast 2');
    toast.success('Toast 3');

    expect(() => toast.clearAll()).not.toThrow();
  });

  it('devrait gérer un titre sans message', () => {
    const toast = useToast();
    const id = toast.success('Titre seulement');

    expect(id).toBeDefined();
  });

  it('devrait gérer les types de toast multiples', () => {
    const toast = useToast();

    const successId = toast.success('Succès');
    const errorId = toast.error('Erreur');
    const warningId = toast.warning('Attention');
    const infoId = toast.info('Info');

    expect(successId).toBeDefined();
    expect(errorId).toBeDefined();
    expect(warningId).toBeDefined();
    expect(infoId).toBeDefined();
  });
});