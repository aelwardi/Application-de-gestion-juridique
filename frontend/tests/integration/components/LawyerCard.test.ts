import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { userEvent } from '@testing-library/user-event';
import LawyerCard from '~/components/lawyers/LawyerCard.vue';
import type { Lawyer } from '~/types/lawyer';

vi.mock('~/composables/useAvatar', () => ({
  useAvatar: () => ({
    getAvatarUrl: (url: string | null) => url || '/default-avatar.png',
  }),
}));

describe('LawyerCard - Tests d\'intégration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockLawyer: Lawyer = {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@example.com',
    phone: '+33123456789',
    role: 'avocat' as const,
    barNumber: 'BAR75001',
    specialties: ['Droit civil', 'Droit pénal', 'Droit de la famille', 'Droit commercial'],
    rating: 4.5,
    totalReviews: 25,
    experienceYears: 8,
    description: 'Avocate expérimentée spécialisée dans le droit civil et pénal avec plus de 8 ans d\'expérience.',
    officeAddress: '123 Rue de la Justice, Paris',
    officeCity: 'Paris',
    hourlyRate: 150,
    isVerified: true,
    totalCases: 50,
    activeCases: 10,
    availabilityStatus: 'available',
    verifiedByAdmin: true,
    profilePictureUrl: '/avatars/lawyer1.jpg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Affichage des données', () => {
    it('devrait afficher les informations de base de l\'avocat', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Marie Dupont');
      expect(wrapper.text()).toContain('BAR75001');
      expect(wrapper.text()).toContain('8 ans d\'expérience');
    });

    it('devrait afficher la photo de profil', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('/avatars/lawyer1.jpg');
      expect(img.attributes('alt')).toContain('Marie Dupont');
    });

    it('devrait afficher la photo par défaut si aucune photo', () => {
      const lawyerWithoutPhoto = { ...mockLawyer, profilePictureUrl: undefined };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithoutPhoto as any },
      });

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('/default-avatar.png');
    });

    it('devrait afficher le badge "Vérifié" si vérifié par admin', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Vérifié');
    });

    it('ne devrait pas afficher le badge "Vérifié" si non vérifié', () => {
      const unverifiedLawyer = { ...mockLawyer, verifiedByAdmin: false };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: unverifiedLawyer },
      });

      expect(wrapper.text()).not.toContain('Vérifié');
    });

    it('devrait afficher la note et le nombre d\'avis', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('4.5');
      expect(wrapper.text()).toContain('25 avis');
    });

    it('devrait afficher les étoiles de notation', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const stars = wrapper.findAll('svg.w-5.h-5');
      expect(stars.length).toBe(5);

      const yellowStars = stars.filter(star =>
        star.classes().includes('text-yellow-400')
      );
      expect(yellowStars.length).toBeGreaterThanOrEqual(4);
    });

    it('devrait afficher les spécialités', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Droit civil');
      expect(wrapper.text()).toContain('Droit pénal');
      expect(wrapper.text()).toContain('Droit de la famille');
    });

    it('devrait afficher seulement 3 spécialités + indicateur si plus de 3', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('+1 autres');
    });

    it('devrait afficher la description', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Avocate expérimentée');
    });

    it('ne devrait pas afficher la description si absente', () => {
      const lawyerWithoutDesc = { ...mockLawyer, description: undefined };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithoutDesc as any },
      });

      const descElement = wrapper.find('p.line-clamp-2');
      expect(descElement.exists()).toBe(false);
    });

    it('devrait afficher la ville', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Paris');
    });

    it('devrait afficher le tarif horaire', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('150€/heure');
    });

    it('devrait afficher le statut de disponibilité', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      expect(wrapper.text()).toContain('Disponible');
    });

    it('devrait afficher "Occupé" si le statut est busy', () => {
      const busyLawyer = { ...mockLawyer, availabilityStatus: 'busy' as const };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: busyLawyer },
      });

      expect(wrapper.text()).toContain('Occupé');
    });

    it('devrait afficher "Indisponible" si le statut est unavailable', () => {
      const unavailableLawyer = { ...mockLawyer, availabilityStatus: 'unavailable' as const };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: unavailableLawyer },
      });

      expect(wrapper.text()).toContain('Indisponible');
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait émettre l\'événement send-request lors du clic sur "Envoyer une demande"', async () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.emitted('send-request')).toBeTruthy();
      expect(wrapper.emitted('send-request')?.[0]).toEqual([mockLawyer]);
    });

    it('devrait avoir un lien vers le profil de l\'avocat', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      });

      const link = wrapper.find('a[href="/lawyers/1"]');
      expect(link.exists()).toBe(true);
      expect(link.text()).toContain('Voir le profil');
    });

    it('devrait avoir des classes hover sur le bouton', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('hover:bg-blue-700');
    });
  });

  describe('États visuels', () => {
    it('devrait avoir une classe de transition sur la carte', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const card = wrapper.find('.bg-white');
      expect(card.classes()).toContain('transition-shadow');
    });

    it('devrait appliquer les bonnes classes de couleur pour statut "available"', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const statusBadge = wrapper.find('.bg-green-100');
      expect(statusBadge.exists()).toBe(true);
      expect(statusBadge.classes()).toContain('text-green-800');
    });

    it('devrait appliquer les bonnes classes de couleur pour statut "busy"', () => {
      const busyLawyer = { ...mockLawyer, availabilityStatus: 'busy' as const };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: busyLawyer },
      });

      const statusBadge = wrapper.find('.bg-orange-100');
      expect(statusBadge.exists()).toBe(true);
    });

    it('devrait appliquer les bonnes classes de couleur pour statut "unavailable"', () => {
      const unavailableLawyer = { ...mockLawyer, availabilityStatus: 'unavailable' as const };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: unavailableLawyer },
      });

      const statusBadge = wrapper.find('.bg-red-100');
      expect(statusBadge.exists()).toBe(true);
    });
  });

  describe('Responsive design', () => {
    it('devrait avoir des classes flexbox pour le responsive', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const container = wrapper.find('.flex.flex-col.md\\:flex-row');
      expect(container.exists()).toBe(true);
    });

    it('devrait avoir des boutons adaptés au mobile', () => {
      const wrapper = mount(LawyerCard, {
        props: { lawyer: mockLawyer },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('flex-1');
      expect(button.classes()).toContain('md:flex-none');
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un avocat sans ville', () => {
      const lawyerWithoutCity = { ...mockLawyer, officeCity: undefined };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithoutCity as any },
      });

      expect(wrapper.html()).toBeTruthy();
    });

    it('devrait gérer un avocat sans tarif horaire', () => {
      const lawyerWithoutRate = { ...mockLawyer, hourlyRate: undefined };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithoutRate as any },
      });

      expect(wrapper.html()).toBeTruthy();
    });

    it('devrait gérer un avocat avec 0 avis', () => {
      const lawyerWithNoReviews = { ...mockLawyer, totalReviews: 0, rating: 0 };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithNoReviews },
      });

      expect(wrapper.text()).toContain('0 avis');
    });

    it('devrait gérer un avocat avec une seule spécialité', () => {
      const lawyerWithOneSpecialty = { ...mockLawyer, specialties: ['Droit civil'] };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWithOneSpecialty },
      });

      expect(wrapper.text()).toContain('Droit civil');
      expect(wrapper.text()).not.toContain('+');
    });

    it('devrait gérer un avocat avec exactement 3 spécialités', () => {
      const lawyerWith3Specialties = {
        ...mockLawyer,
        specialties: ['Droit civil', 'Droit pénal', 'Droit de la famille'],
      };
      const wrapper = mount(LawyerCard, {
        props: { lawyer: lawyerWith3Specialties },
      });

      expect(wrapper.text()).not.toContain('autres');
    });
  });
});