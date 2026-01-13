import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime, isToday, isFuture, isPast } from '~/utils/date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('devrait formater une date', () => {
      const date = '2026-01-15';
      const result = formatDate(date);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('devrait gérer une date invalide', () => {
      const result = formatDate('invalid-date');

      expect(result).toBe('Date invalide');
    });

    it('devrait gérer null', () => {
      const result = formatDate(null as any);

      expect(result).toBe('Date invalide');
    });
  });

  describe('formatDateTime', () => {
    it('devrait formater date et heure', () => {
      const date = '2026-01-15T10:30:00Z';
      const result = formatDateTime(date);

      expect(result).toBeTruthy();
      expect(result).toContain(':');
    });

    it('devrait gérer une date invalide', () => {
      const result = formatDateTime('invalid');

      expect(result).toBe('Date invalide');
    });
  });

  describe('formatRelativeTime', () => {
    it('devrait retourner "à l\'instant" pour maintenant', () => {
      const now = new Date().toISOString();
      const result = formatRelativeTime(now);

      expect(result).toContain('instant');
    });

    it('devrait retourner "il y a X minutes"', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatRelativeTime(fiveMinutesAgo);

      expect(result).toContain('minute');
    });

    it('devrait retourner "il y a X heures"', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const result = formatRelativeTime(twoHoursAgo);

      expect(result).toContain('heure');
    });

    it('devrait retourner "il y a X jours"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatRelativeTime(threeDaysAgo);

      expect(result).toContain('jour');
    });

    it('devrait gérer une date future', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = formatRelativeTime(tomorrow);

      expect(result).toBeTruthy();
    });
  });

  describe('isToday', () => {
    it('devrait retourner true pour aujourd\'hui', () => {
      const today = new Date().toISOString();
      const result = isToday(today);

      expect(result).toBe(true);
    });

    it('devrait retourner false pour hier', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = isToday(yesterday);

      expect(result).toBe(false);
    });

    it('devrait retourner false pour demain', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = isToday(tomorrow);

      expect(result).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('devrait retourner true pour une date future', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = isFuture(future);

      expect(result).toBe(true);
    });

    it('devrait retourner false pour le passé', () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = isFuture(past);

      expect(result).toBe(false);
    });

    it('devrait retourner false pour maintenant', () => {
      const now = new Date().toISOString();
      const result = isFuture(now);

      expect(result).toBe(false);
    });
  });

  describe('isPast', () => {
    it('devrait retourner true pour le passé', () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = isPast(past);

      expect(result).toBe(true);
    });

    it('devrait retourner false pour le futur', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = isPast(future);

      expect(result).toBe(false);
    });

    it('devrait retourner false pour maintenant', () => {
      const now = new Date().toISOString();
      const result = isPast(now);

      expect(result).toBe(false);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer une chaîne vide', () => {
      expect(formatDate('')).toBe('Date invalide');
      expect(formatDateTime('')).toBe('Date invalide');
    });

    it('devrait gérer undefined', () => {
      expect(formatDate(undefined as any)).toBe('Date invalide');
    });

    it('devrait gérer des dates très anciennes', () => {
      const ancient = '1900-01-01T00:00:00Z';
      const result = formatDate(ancient);

      expect(result).toBeTruthy();
    });

    it('devrait gérer des dates très futures', () => {
      const farFuture = '2100-12-31T23:59:59Z';
      const result = formatDate(farFuture);

      expect(result).toBeTruthy();
    });
  });
});