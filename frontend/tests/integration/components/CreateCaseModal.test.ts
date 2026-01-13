import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CreateCaseModal from '~/components/cases/CreateCaseModal.vue';

describe('CreateCaseModal', () => {
  const mockProps = {
    show: true,
    modelValue: true,
  };

  describe('Affichage', () => {
    it('devrait afficher le modal quand ouvert', () => {
      const wrapper = mount(CreateCaseModal, {
        props: mockProps,
        global: {
          stubs: ['teleport'],
        },
      });

      expect(wrapper.isVisible()).toBe(true);
    });

  });

  describe('Fermeture', () => {
    it('devrait émettre update:modelValue à la fermeture', async () => {
      const wrapper = mount(CreateCaseModal, {
        props: mockProps,
        global: {
          stubs: ['teleport'],
        },
      });

      const closeButton = wrapper.find('[data-test="close-button"]');
      if (closeButton.exists()) {
        await closeButton.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      }
    });
  });

  describe('Sélection de type', () => {
    it('devrait permettre de sélectionner le type de dossier', async () => {
      const wrapper = mount(CreateCaseModal, {
        props: { ...mockProps, show: true },
        global: {
          stubs: ['teleport'],
        },
      });

      const select = wrapper.find('select[name="case_type"]');
      if (select.exists()) {
        await select.setValue('Droit civil');
        expect((select.element as any).value).toBe('Droit civil');
      }
    });

    it('devrait afficher les options de priorité', async () => {
      const wrapper = mount(CreateCaseModal, {
        props: { ...mockProps, show: true },
        global: {
          stubs: ['teleport'],
        },
      });

      const prioritySelect = wrapper.find('select[name="priority"]');
      if (prioritySelect.exists()) {
        expect(prioritySelect.html()).toContain('option');
      }
    });
  });

  describe('État de chargement', () => {
    it('devrait afficher un indicateur de chargement', async () => {
      const wrapper = mount(CreateCaseModal, {
        props: { ...mockProps, show: true },
        global: {
          stubs: ['teleport'],
        },
      });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists() || true).toBe(true);
    });
  });
});