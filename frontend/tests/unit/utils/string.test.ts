import { describe, it, expect } from 'vitest';
import { truncate, capitalize, slugify, extractInitials } from '~/utils/string';

describe('String Utils', () => {
  describe('truncate', () => {
    it('devrait tronquer une chaîne longue', () => {
      const text = 'Ceci est un texte très long qui doit être tronqué';
      const result = truncate(text, 20);

      expect(result.length).toBeLessThanOrEqual(23);
      expect(result).toContain('...');
    });

    it('ne devrait pas tronquer si sous la limite', () => {
      const text = 'Court texte';
      const result = truncate(text, 50);

      expect(result).toBe(text);
      expect(result).not.toContain('...');
    });

    it('devrait gérer une chaîne vide', () => {
      const result = truncate('', 10);

      expect(result).toBe('');
    });
  });

  describe('capitalize', () => {
    it('devrait mettre en majuscule la première lettre', () => {
      const result = capitalize('bonjour');

      expect(result).toBe('Bonjour');
    });

    it('devrait gérer une chaîne déjà capitalisée', () => {
      const result = capitalize('Bonjour');

      expect(result).toBe('Bonjour');
    });

    it('devrait gérer une chaîne vide', () => {
      const result = capitalize('');

      expect(result).toBe('');
    });

    it('devrait gérer une lettre seule', () => {
      const result = capitalize('a');

      expect(result).toBe('A');
    });
  });

  describe('slugify', () => {
    it('devrait créer un slug', () => {
      const result = slugify('Titre de Mon Article');

      expect(result).toBe('titre-de-mon-article');
    });

    it('devrait gérer les accents', () => {
      const result = slugify('Héllo Wörld');

      expect(result).toBe('hello-world');
    });

    it('devrait gérer les caractères spéciaux', () => {
      const result = slugify('Test @#$ 123');

      expect(result).toBe('test-123');
    });

    it('devrait gérer les espaces multiples', () => {
      const result = slugify('Test    Multiple    Spaces');

      expect(result).toBe('test-multiple-spaces');
    });

    it('devrait gérer une chaîne vide', () => {
      const result = slugify('');

      expect(result).toBe('');
    });
  });

  describe('extractInitials', () => {
    it('devrait extraire les initiales', () => {
      const result = extractInitials('Jean', 'Dupont');

      expect(result).toBe('JD');
    });

    it('devrait gérer un seul nom', () => {
      const result = extractInitials('Jean', '');

      expect(result).toBe('J');
    });

    it('devrait gérer un prénom vide', () => {
      const result = extractInitials('', 'Dupont');

      expect(result).toBe('D');
    });

    it('devrait retourner ? si vide', () => {
      const result = extractInitials('', '');

      expect(result).toBe('?');
    });

    it('devrait mettre en majuscule', () => {
      const result = extractInitials('jean', 'dupont');

      expect(result).toBe('JD');
    });
  });

  describe('Cas limites', () => {
    it('truncate devrait gérer un nombre négatif', () => {
      const result = truncate('Test', -5);

      expect(result).toBe('Test');
    });

    it('slugify devrait gérer uniquement des espaces', () => {
      const result = slugify('   ');

      expect(result).toBe('');
    });

    it('capitalize devrait gérer des chiffres', () => {
      const result = capitalize('123abc');

      expect(result).toBe('123abc');
    });
  });
});