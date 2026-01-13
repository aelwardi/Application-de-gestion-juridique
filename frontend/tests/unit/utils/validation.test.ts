import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePostalCode,
  calculatePasswordStrength,
  validatePassword,
  formatPhoneNumber,
  validateSiret,
  validateUrl,
  formatName,
  validateDate,
  isFutureDate,
  isPastDate,
} from '~/utils/validation';

describe('Validation Utils - Tests Unitaires', () => {
  describe('validateEmail', () => {
    it('devrait valider des emails corrects', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.fr')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('devrait rejeter des emails incorrects', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });

    it('devrait gérer les chaînes vides', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('devrait valider des numéros français corrects', () => {
      expect(validatePhone('0612345678')).toBe(true);
      expect(validatePhone('06 12 34 56 78')).toBe(true);
      expect(validatePhone('06.12.34.56.78')).toBe(true);
      expect(validatePhone('06-12-34-56-78')).toBe(true);
      expect(validatePhone('+33612345678')).toBe(true);
      expect(validatePhone('+33 6 12 34 56 78')).toBe(true);
      expect(validatePhone('0033612345678')).toBe(true);
    });

    it('devrait rejeter des numéros incorrects', () => {
      expect(validatePhone('1234567890')).toBe(false); // Ne commence pas par 0
      expect(validatePhone('0012345678')).toBe(false); // Commence par 00
      expect(validatePhone('061234567')).toBe(false); // Trop court
      expect(validatePhone('06123456789')).toBe(false); // Trop long
      expect(validatePhone('abc')).toBe(false);
    });

    it('devrait gérer les chaînes vides', () => {
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    it('devrait valider des codes postaux français corrects', () => {
      expect(validatePostalCode('75001')).toBe(true);
      expect(validatePostalCode('13000')).toBe(true);
      expect(validatePostalCode('69008')).toBe(true);
    });

    it('devrait rejeter des codes postaux incorrects', () => {
      expect(validatePostalCode('7500')).toBe(false); // Trop court
      expect(validatePostalCode('750011')).toBe(false); // Trop long
      expect(validatePostalCode('ABCDE')).toBe(false); // Lettres
      expect(validatePostalCode('7500A')).toBe(false); // Mélange
    });

    it('devrait gérer les chaînes vides', () => {
      expect(validatePostalCode('')).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('devrait retourner 0 pour un mot de passe vide', () => {
      expect(calculatePasswordStrength('')).toBe(0);
    });

    it('devrait donner un score faible pour un mot de passe simple', () => {
      const strength = calculatePasswordStrength('abc');
      expect(strength).toBeLessThan(30);
    });

    it('devrait donner un score moyen pour un mot de passe avec longueur et complexité', () => {
      const strength = calculatePasswordStrength('Abcd1234');
      expect(strength).toBeGreaterThanOrEqual(50);
      expect(strength).toBeLessThan(80);
    });

    it('devrait donner un score élevé pour un mot de passe fort', () => {
      const strength = calculatePasswordStrength('Abcd1234!@#$');
      expect(strength).toBeGreaterThanOrEqual(80);
    });

    it('devrait plafonner à 100', () => {
      const strength = calculatePasswordStrength('VeryStrongPassword123!@#$%^&*');
      expect(strength).toBe(100);
    });

    it('devrait augmenter avec la longueur', () => {
      const short = calculatePasswordStrength('Abc123');
      const medium = calculatePasswordStrength('Abcd1234');
      const long = calculatePasswordStrength('Abcdefgh12345');

      expect(medium).toBeGreaterThan(short);
      expect(long).toBeGreaterThan(medium);
    });

    it('devrait augmenter avec des caractères spéciaux', () => {
      const withoutSpecial = calculatePasswordStrength('Abcd1234');
      const withSpecial = calculatePasswordStrength('Abcd1234!@');

      expect(withSpecial).toBeGreaterThan(withoutSpecial);
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe fort', () => {
      const result = validatePassword('Abcd1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const result = validatePassword('Abc1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
    });

    it('devrait rejeter un mot de passe sans minuscule', () => {
      const result = validatePassword('ABCD1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
    });

    it('devrait rejeter un mot de passe sans majuscule', () => {
      const result = validatePassword('abcd1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
    });

    it('devrait rejeter un mot de passe sans chiffre', () => {
      const result = validatePassword('AbcdEfgh');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
    });

    it('devrait retourner plusieurs erreurs pour un mot de passe très faible', () => {
      const result = validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('formatPhoneNumber', () => {
    it('devrait formater un numéro français avec +33', () => {
      expect(formatPhoneNumber('+33612345678')).toBe('+33 6 12 34 56 78');
    });

    it('devrait formater un numéro français avec 0', () => {
      expect(formatPhoneNumber('0612345678')).toBe('06 12 34 56 78');
    });

    it('devrait nettoyer les caractères non numériques', () => {
      expect(formatPhoneNumber('+33 6-12.34.56.78')).toBe('+33 6 12 34 56 78');
    });

    it('devrait retourner le numéro original si format inconnu', () => {
      expect(formatPhoneNumber('1234567890')).toBe('1234567890');
    });

    it('devrait gérer les numéros déjà formatés', () => {
      const formatted = formatPhoneNumber('+33 6 12 34 56 78');
      expect(formatted).toBe('+33 6 12 34 56 78');
    });
  });

  describe('validateSiret', () => {
    it('devrait valider un SIRET correct', () => {
      // SIRET valide selon l'algorithme de Luhn
      expect(validateSiret('73282932000074')).toBe(true);
      expect(validateSiret('732 829 320 00074')).toBe(true); // Avec espaces
    });

    it('devrait rejeter un SIRET avec mauvaise longueur', () => {
      expect(validateSiret('1234567890')).toBe(false);
      expect(validateSiret('123456789012345')).toBe(false);
    });

    it('devrait rejeter un SIRET avec lettres', () => {
      expect(validateSiret('7328293200007A')).toBe(false);
    });

    it('devrait rejeter un SIRET avec mauvaise clé de contrôle', () => {
      expect(validateSiret('73282932000075')).toBe(false); // Mauvaise clé
    });
  });

  describe('validateUrl', () => {
    it('devrait valider des URLs correctes', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://www.example.com/path')).toBe(true);
      expect(validateUrl('https://example.com:8080')).toBe(true);
    });

    it('devrait rejeter des URLs incorrectes', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false); // Sans protocole
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('formatName', () => {
    it('devrait formater un nom avec majuscule initiale', () => {
      expect(formatName('john')).toBe('John');
      expect(formatName('JOHN')).toBe('John');
      expect(formatName('jOhN')).toBe('John');
    });

    it('devrait formater un nom composé', () => {
      expect(formatName('jean-paul')).toBe('Jean-paul');
      expect(formatName('marie claire')).toBe('Marie Claire');
    });

    it('devrait gérer les espaces multiples', () => {
      expect(formatName('  john  doe  ')).toBe('John Doe');
    });

    it('devrait gérer les noms avec apostrophes', () => {
      expect(formatName("o'connor")).toBe("O'connor");
    });

    it('devrait gérer les chaînes vides', () => {
      expect(formatName('')).toBe('');
      expect(formatName('   ')).toBe('');
    });
  });

  describe('validateDate', () => {
    it('devrait valider des dates ISO correctes', () => {
      expect(validateDate('2026-01-15')).toBe(true);
      expect(validateDate('2026-01-15T10:30:00')).toBe(true);
      expect(validateDate('2026-01-15T10:30:00Z')).toBe(true);
    });

    it('devrait rejeter des dates invalides', () => {
      expect(validateDate('invalid')).toBe(false);
      expect(validateDate('2026-13-01')).toBe(false); // Mois invalide
      expect(validateDate('2026-01-32')).toBe(false); // Jour invalide
    });

    it('devrait gérer les chaînes vides', () => {
      expect(validateDate('')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('devrait identifier une date future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isFutureDate(futureDate.toISOString())).toBe(true);
    });

    it('devrait identifier une date passée comme non future', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(isFutureDate(pastDate.toISOString())).toBe(false);
    });

    it('devrait gérer la date actuelle', () => {
      const now = new Date();
      // La date actuelle n'est pas strictement dans le futur
      expect(isFutureDate(now.toISOString())).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('devrait identifier une date passée', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(isPastDate(pastDate.toISOString())).toBe(true);
    });

    it('devrait identifier une date future comme non passée', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isPastDate(futureDate.toISOString())).toBe(false);
    });

    it('devrait gérer la date actuelle', () => {
      const now = new Date();
      expect(isPastDate(now.toISOString())).toBe(false);
    });
  });
});