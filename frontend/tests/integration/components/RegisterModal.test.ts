import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { userEvent } from '@testing-library/user-event';
import RegisterModal from '~/components/auth/RegisterModal.vue';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('~/composables/useAvatar', () => ({
  useAvatar: () => ({
    getAvatarUrl: (url: string | null) => url || '/default-avatar.png',
  }),
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockAuthStore = {
  register: vi.fn(),
  login: vi.fn(),
  user: null,
  isAuthenticated: false,
};

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

vi.mock('~/components/common/AddressAutocomplete.vue', () => ({
  default: {
    name: 'AddressAutocomplete',
    template: '<input type="text" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}));

describe('RegisterModal - Tests d\'intégration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    setActivePinia(createPinia());
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Sélection du type d\'utilisateur', () => {
    it('devrait afficher client comme type par défaut', () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      expect(wrapper.vm.selectedUserType).toBe('client');
    });

    it('devrait utiliser le userType passé en props', () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
          userType: 'avocat',
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      expect(wrapper.vm.selectedUserType).toBe('avocat');
    });

    it('devrait changer le formulaire en fonction du type sélectionné', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      expect(wrapper.vm.form.role).toBe('client');

      wrapper.vm.selectedUserType = 'avocat';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.form.role).toBe('avocat');
    });
  });

  describe('Validation du mot de passe', () => {
    it('devrait calculer la force du mot de passe', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.password = 'abc';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.passwordStrength).toBeLessThan(25);

      wrapper.vm.form.password = 'Abcd1234';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(50);

      wrapper.vm.form.password = 'Abcd1234!@#$';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(75);
    });

    it('devrait afficher le texte de force du mot de passe', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.password = 'ab';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.passwordStrengthText).toBe('Très faible');

      wrapper.vm.form.password = 'Abc123';
      await wrapper.vm.$nextTick();
      expect(['Faible', 'Moyen']).toContain(wrapper.vm.passwordStrengthText);

      wrapper.vm.form.password = 'Abcd1234!@#$';
      await wrapper.vm.$nextTick();
      expect(['Fort', 'Très fort']).toContain(wrapper.vm.passwordStrengthText);
    });

    it('devrait valider que les mots de passe correspondent', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'DifferentPassword';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      await wrapper.vm.handleRegister();
      await flushPromises();

      expect(wrapper.vm.errorMessage).toContain('ne correspondent pas');
      expect(mockAuthStore.register).not.toHaveBeenCalled();
    });
  });

  describe('Validation des champs avocat', () => {
    it('devrait valider le numéro du barreau pour les avocats', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
          userType: 'avocat',
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'lawyer@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'Jane';
      wrapper.vm.form.lastName = 'Smith';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.form.lawyerData.barNumber = '';
      wrapper.vm.acceptTerms = true;

      await wrapper.vm.handleRegister();
      await flushPromises();

      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Soumission du formulaire - État de chargement', () => {
    it('devrait afficher l\'état de chargement pendant l\'inscription', async () => {
      mockAuthStore.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      const registerPromise = wrapper.vm.handleRegister();

      expect(wrapper.vm.isLoading).toBe(true);

      await registerPromise;
      await flushPromises();

      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('devrait désactiver le bouton pendant le chargement', async () => {
      mockAuthStore.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.isLoading = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait afficher une erreur si l\'inscription échoue', async () => {
      mockAuthStore.register.mockRejectedValue(new Error('Registration failed'));

      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      await wrapper.vm.handleRegister();
      await flushPromises();

      expect(wrapper.vm.errorMessage).toBeTruthy();
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('devrait réinitialiser les erreurs lors d\'une nouvelle tentative', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.errorMessage = 'Erreur précédente';
      wrapper.vm.validationErrors = ['Erreur 1', 'Erreur 2'];

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      const registerPromise = wrapper.vm.handleRegister();

      expect(wrapper.vm.errorMessage).toBe('');
      expect(wrapper.vm.validationErrors).toEqual([]);

      await registerPromise;
      await flushPromises();
    });
  });

  describe('Inscription réussie', () => {
    it('devrait émettre l\'événement success après une inscription réussie', async () => {
      mockAuthStore.register.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'test@example.com' },
      });

      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      await wrapper.vm.handleRegister();
      await flushPromises();

      expect(wrapper.emitted('success')).toBeTruthy();
    });

    it('devrait fermer le modal après une inscription réussie', async () => {
      mockAuthStore.register.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'test@example.com' },
      });

      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.acceptTerms = true;

      await wrapper.vm.handleRegister();
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });

  describe('Fermeture du modal', () => {
    it('devrait émettre update:modelValue lors de la fermeture', () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.closeModal();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('devrait réinitialiser le formulaire lors de la fermeture', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.form.email = 'test@example.com';
      wrapper.vm.form.password = 'Password123!';
      wrapper.vm.confirmPassword = 'Password123!';
      wrapper.vm.form.firstName = 'John';
      wrapper.vm.form.lastName = 'Doe';

      wrapper.vm.closeModal();

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(wrapper.vm.form.email).toBe('');
      expect(wrapper.vm.form.password).toBe('');
      expect(wrapper.vm.confirmPassword).toBe('');
    });
  });

  describe('Gestion des spécialités (avocat)', () => {
    it('devrait convertir l\'input des spécialités en tableau', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
          userType: 'avocat',
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.specialtiesInput = 'Droit civil, Droit pénal, Droit de la famille';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.form.lawyerData.specialties).toEqual([
        'Droit civil',
        'Droit pénal',
        'Droit de la famille',
      ]);
    });

    it('devrait ignorer les espaces et les virgules vides', async () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
          userType: 'avocat',
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      wrapper.vm.specialtiesInput = 'Droit civil,  , Droit pénal,  ';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.form.lawyerData.specialties).toEqual([
        'Droit civil',
        'Droit pénal',
      ]);
    });
  });

  describe('Checkbox des conditions', () => {
    it('devrait nécessiter l\'acceptation des conditions', () => {
      const wrapper = mount(RegisterModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            AddressAutocomplete: true,
          },
        },
      });

      expect(wrapper.vm.acceptTerms).toBe(false);
    });
  });
});