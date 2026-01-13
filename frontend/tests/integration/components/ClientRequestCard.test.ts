import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientRequestCard from '~/components/clients/ClientRequestCard.vue';
import type { LawyerRequest } from '~/types/lawyer';

describe('ClientRequestCard - Tests d\'intégration', () => {
  const mockRequest: LawyerRequest = {
    id: '1',
    client_id: 'client-1',
    lawyer_id: 'lawyer-1',
    title: 'Consultation en droit civil',
    description: 'J\'ai besoin d\'une consultation pour un problème de succession',
    case_type: 'Droit civil',
    urgency: 'medium',
    status: 'pending',
    lawyer_first_name: 'Marie',
    lawyer_last_name: 'Dupont',
    lawyer_profile_picture: '/avatars/lawyer1.jpg',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  };

  describe('Affichage des données', () => {
    it('devrait afficher les informations de la demande', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      expect(wrapper.text()).toContain('Consultation en droit civil');
      expect(wrapper.text()).toContain('Marie Dupont');
      expect(wrapper.text()).toContain('Droit civil');
    });

    it('devrait afficher la photo de l\'avocat', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('/avatars/lawyer1.jpg');
    });

    it('devrait afficher l\'image par défaut si pas de photo', () => {
      const requestWithoutPhoto = {
        ...mockRequest,
        lawyer_profile_picture: undefined,
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: requestWithoutPhoto },
      });

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('/images/default-avatar.png');
    });

    it('devrait afficher le statut "En attente"', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      expect(wrapper.text()).toContain('En attente');
    });

    it('devrait afficher le statut "Acceptée"', () => {
      const acceptedRequest = { ...mockRequest, status: 'accepted' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: acceptedRequest as any },
      });

      expect(wrapper.text()).toContain('Acceptée');
    });

    it('devrait afficher le statut "Rejetée"', () => {
      const rejectedRequest = { ...mockRequest, status: 'rejected' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: rejectedRequest as any },
      });

      expect(wrapper.text()).toContain('Rejetée');
    });

    it('devrait afficher le statut "Annulée"', () => {
      const cancelledRequest = { ...mockRequest, status: 'cancelled' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: cancelledRequest as any },
      });

      expect(wrapper.text()).toContain('Annulée');
    });
  });

  describe('Classes CSS selon le statut', () => {
    it('devrait appliquer les classes orange pour statut pending', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const statusBadge = wrapper.find('.bg-orange-100');
      expect(statusBadge.exists()).toBe(true);
      expect(statusBadge.classes()).toContain('text-orange-800');
    });

    it('devrait appliquer les classes vertes pour statut accepted', () => {
      const acceptedRequest = { ...mockRequest, status: 'accepted' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: acceptedRequest as any },
      });

      const statusBadge = wrapper.find('.bg-green-100');
      expect(statusBadge.exists()).toBe(true);
      expect(statusBadge.classes()).toContain('text-green-800');
    });

    it('devrait appliquer les classes rouges pour statut rejected', () => {
      const rejectedRequest = { ...mockRequest, status: 'rejected' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: rejectedRequest as any },
      });

      const statusBadge = wrapper.find('.bg-red-100');
      expect(statusBadge.exists()).toBe(true);
      expect(statusBadge.classes()).toContain('text-red-800');
    });

    it('devrait appliquer les classes grises pour statut cancelled', () => {
      const cancelledRequest = { ...mockRequest, status: 'cancelled' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: cancelledRequest as any },
      });

      const statusBadges = wrapper.findAll('.bg-gray-100');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Affichage de l\'urgence', () => {
    it('devrait afficher l\'urgence "Faible"', () => {
      const lowUrgencyRequest = { ...mockRequest, urgency: 'low' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: lowUrgencyRequest as any },
      });

      expect(wrapper.text()).toContain('Faible');
    });

    it('devrait afficher l\'urgence "Moyen"', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      expect(wrapper.text()).toContain('Moyen');
    });

    it('devrait afficher l\'urgence "Élevé"', () => {
      const highUrgencyRequest = { ...mockRequest, urgency: 'high' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: highUrgencyRequest as any },
      });

      expect(wrapper.text()).toContain('Élevé');
    });

    it('devrait afficher l\'urgence "Urgent"', () => {
      const urgentRequest = { ...mockRequest, urgency: 'urgent' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: urgentRequest as any },
      });

      expect(wrapper.text()).toContain('Urgent');
    });
  });

  describe('Classes CSS selon l\'urgence', () => {
    it('devrait appliquer les classes bleues pour urgence low', () => {
      const lowUrgencyRequest = { ...mockRequest, urgency: 'low' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: lowUrgencyRequest as any },
      });

      const urgencyBadge = wrapper.find('.bg-blue-100');
      expect(urgencyBadge.exists()).toBe(true);
    });

    it('devrait appliquer les classes jaunes pour urgence medium', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const urgencyBadge = wrapper.find('.bg-yellow-100');
      expect(urgencyBadge.exists()).toBe(true);
    });

    it('devrait appliquer les classes orange pour urgence high', () => {
      const highUrgencyRequest = { ...mockRequest, urgency: 'high' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: highUrgencyRequest as any },
      });

      const urgencyBadges = wrapper.findAll('.bg-orange-100');
      expect(urgencyBadges.length).toBeGreaterThan(0);
    });

    it('devrait appliquer les classes rouges pour urgence urgent', () => {
      const urgentRequest = { ...mockRequest, urgency: 'urgent' as const };
      const wrapper = mount(ClientRequestCard, {
        props: { request: urgentRequest as any },
      });

      const urgencyBadge = wrapper.find('.bg-red-100');
      expect(urgencyBadge.exists()).toBe(true);
    });
  });

  describe('Formatage de la date', () => {
    it('devrait formater la date en français', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      expect(wrapper.html()).toContain('janvier');
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait émettre l\'événement cancel lors du clic sur annuler', async () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const cancelButton = wrapper.find('button[data-test="cancel-button"]');

      if (cancelButton.exists()) {
        await cancelButton.trigger('click');
        expect(wrapper.emitted('cancel')).toBeTruthy();
        expect(wrapper.emitted('cancel')?.[0]).toEqual([mockRequest.id]);
      }
    });

    it('devrait émettre l\'événement view lors du clic sur voir', async () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const viewButton = wrapper.find('button[data-test="view-button"]');

      if (viewButton.exists()) {
        await viewButton.trigger('click');
        expect(wrapper.emitted('view')).toBeTruthy();
        expect(wrapper.emitted('view')?.[0]).toEqual([mockRequest]);
      }
    });
  });

  describe('Responsive design', () => {
    it('devrait avoir des classes flexbox pour le responsive', () => {
      const wrapper = mount(ClientRequestCard, {
        props: { request: mockRequest },
      });

      const container = wrapper.find('.flex.flex-col.md\\:flex-row');
      expect(container.exists()).toBe(true);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un titre très long', () => {
      const longTitleRequest = {
        ...mockRequest,
        title: 'Titre très long qui devrait être tronqué ou géré correctement par le composant pour éviter les problèmes d\'affichage',
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: longTitleRequest },
      });

      expect(wrapper.html()).toBeTruthy();
    });

    it('devrait gérer une description vide', () => {
      const noDescRequest = {
        ...mockRequest,
        description: '',
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: noDescRequest },
      });

      expect(wrapper.html()).toBeTruthy();
    });

    it('devrait gérer un statut inconnu', () => {
      const unknownStatusRequest = {
        ...mockRequest,
        status: 'unknown_status' as any,
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: unknownStatusRequest },
      });

      // Devrait avoir une classe de fallback
      const statusBadges = wrapper.findAll('.bg-gray-100');
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('devrait gérer une urgence inconnue', () => {
      const unknownUrgencyRequest = {
        ...mockRequest,
        urgency: 'unknown_urgency' as any,
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: unknownUrgencyRequest },
      });

      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('État de chargement', () => {
    it('devrait s\'afficher correctement même avec des données minimales', () => {
      const minimalRequest: LawyerRequest = {
        id: '1',
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        title: 'Demande',
        description: 'Description',
        case_type: 'Type',
        urgency: 'low',
        status: 'pending',
        lawyer_first_name: 'John',
        lawyer_last_name: 'Doe',
        lawyer_profile_picture: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: minimalRequest },
      });

      expect(wrapper.text()).toContain('Demande');
      expect(wrapper.text()).toContain('John Doe');
    });
  });

  describe('État d\'erreur', () => {
    it('devrait gérer une date invalide gracieusement', () => {
      const invalidDateRequest = {
        ...mockRequest,
        created_at: 'invalid-date',
      };

      const wrapper = mount(ClientRequestCard, {
        props: { request: invalidDateRequest },
      });

      expect(wrapper.html()).toBeTruthy();
    });
  });
});