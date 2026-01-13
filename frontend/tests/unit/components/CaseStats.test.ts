import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CaseStats from '~/components/cases/CaseStats.vue';
import { mockCasesList } from '../../fixtures/case.fixture';

describe('CaseStats', () => {
  it('devrait rendre les statistiques correctement', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h3').text()).toContain('Statistiques');
  });

  it('devrait calculer les statistiques de statut correctement', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    const stats = component.statusStats;

    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);

    const totalPercentage = stats.reduce((sum: number, stat: any) => sum + stat.percentage, 0);
    expect(totalPercentage).toBeGreaterThan(0);
    expect(totalPercentage).toBeLessThanOrEqual(100);
  });

  it('devrait calculer les statistiques de priorité correctement', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    const stats = component.priorityStats;

    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);
  });

  it('devrait calculer le taux de complétion', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    const rate = component.completionRate;

    expect(typeof rate).toBe('number');
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it('devrait compter les cas urgents', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    const urgentCount = component.urgentCount;

    expect(typeof urgentCount).toBe('number');
    expect(urgentCount).toBeGreaterThanOrEqual(0);
  });

  it('devrait gérer un tableau vide de cas', () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: [],
      },
    });

    const component = wrapper.vm as any;

    expect(component.statusStats).toBeDefined();
    expect(component.priorityStats).toBeDefined();
    expect(component.completionRate).toBe(0);
    expect(component.urgentCount).toBe(0);
  });

  it('devrait basculer l\'état étendu au clic', async () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    expect(component.isExpanded).toBe(false);

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(component.isExpanded).toBe(true);
  });

  it('devrait afficher le contenu étendu quand isExpanded est true', async () => {
    const wrapper = mount(CaseStats, {
      props: {
        cases: mockCasesList,
      },
    });

    const component = wrapper.vm as any;
    component.isExpanded = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain('Répartition par statut');
  });
});

