import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const DocumentRequestModal = {
  name: 'DocumentRequestModal',
  template: `
    <div v-if="modelValue" class="modal">
      <form @submit.prevent="handleSubmit">
        <input v-model="form.title" name="title" />
        <textarea v-model="form.description" name="description" />
        <select v-model="form.urgency" name="urgency">
          <option value="low">Faible</option>
          <option value="medium">Moyen</option>
          <option value="high">Élevé</option>
        </select>
        <button type="submit">Envoyer</button>
        <button type="button" @click="$emit('update:modelValue', false)">Fermer</button>
      </form>
    </div>
  `,
  props: {
    modelValue: Boolean,
    caseId: String,
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      form: {
        title: '',
        description: '',
        urgency: 'medium',
      },
    };
  },
  methods: {
    handleSubmit() {
      if (this.form.title && this.form.description) {
        this.$emit('submit', { ...this.form, case_id: this.caseId });
      }
    },
  },
};

describe('DocumentRequestModal', () => {
  const mockProps = {
    modelValue: true,
    caseId: 'case-1',
  };

  describe('Affichage', () => {
    it('devrait afficher le modal', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      expect(wrapper.find('.modal').exists()).toBe(true);
    });

    it('ne devrait pas afficher si modelValue est false', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: { ...mockProps, modelValue: false },
      });

      expect(wrapper.find('.modal').exists()).toBe(false);
    });

    it('devrait afficher les champs du formulaire', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      expect(wrapper.find('input[name="title"]').exists()).toBe(true);
      expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
      expect(wrapper.find('select[name="urgency"]').exists()).toBe(true);
    });
  });

  describe('Saisie de données', () => {
    it('devrait mettre à jour le titre', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('input[name="title"]').setValue('Document requis');
      expect(wrapper.vm.form.title).toBe('Document requis');
    });

    it('devrait mettre à jour la description', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('textarea[name="description"]').setValue('Description détaillée');
      expect(wrapper.vm.form.description).toBe('Description détaillée');
    });

    it('devrait mettre à jour l\'urgence', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('select[name="urgency"]').setValue('high');
      expect(wrapper.vm.form.urgency).toBe('high');
    });
  });

  describe('Soumission', () => {
    it('devrait émettre submit avec les données', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('input[name="title"]').setValue('Test Document');
      await wrapper.find('textarea[name="description"]').setValue('Test Description');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.emitted('submit')?.[0]).toEqual([{
        title: 'Test Document',
        description: 'Test Description',
        urgency: 'medium',
        case_id: 'case-1',
      }]);
    });

    it('ne devrait pas soumettre si titre vide', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('textarea[name="description"]').setValue('Description');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('ne devrait pas soumettre si description vide', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('input[name="title"]').setValue('Titre');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });

  describe('Fermeture', () => {
    it('devrait émettre update:modelValue au clic sur fermer', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      const closeButton = wrapper.findAll('button').find(btn => btn.text() === 'Fermer');
      await closeButton?.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });

  describe('Options d\'urgence', () => {
    it('devrait afficher toutes les options d\'urgence', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      const options = wrapper.findAll('select[name="urgency"] option');
      expect(options).toHaveLength(3);
      expect(options[0].text()).toBe('Faible');
      expect(options[1].text()).toBe('Moyen');
      expect(options[2].text()).toBe('Élevé');
    });

    it('devrait avoir medium comme valeur par défaut', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      expect(wrapper.vm.form.urgency).toBe('medium');
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un caseId vide', () => {
      const wrapper = mount(DocumentRequestModal, {
        props: { ...mockProps, caseId: '' },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('devrait gérer une soumission multiple', async () => {
      const wrapper = mount(DocumentRequestModal, {
        props: mockProps,
      });

      await wrapper.find('input[name="title"]').setValue('Test');
      await wrapper.find('textarea[name="description"]').setValue('Test');

      await wrapper.find('form').trigger('submit');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toHaveLength(2);
    });
  });
});