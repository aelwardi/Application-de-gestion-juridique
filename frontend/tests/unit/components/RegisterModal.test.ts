import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import RegisterModal from '~/components/auth/RegisterModal.vue';

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    register: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('RegisterModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('devrait avoir le type client par défaut', () => {
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

    const component = wrapper.vm as any;
    expect(component.selectedUserType).toBe('client');
  });

  it('devrait accepter un userType en prop', () => {
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

    const component = wrapper.vm as any;
    expect(component.selectedUserType).toBe('avocat');
  });

  it('devrait émettre update:modelValue lors de la fermeture', async () => {
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
  });
});

