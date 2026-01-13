import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CaseStats from '~/components/cases/CaseStats.vue';

describe('CaseStats - Tests d\'Intégration', () => {
  const mockCases = [
    { id: '1', status: 'pending', priority: 'urgent', title: 'Case 1' },
    { id: '2', status: 'in_progress', priority: 'high', title: 'Case 2' },
    { id: '3', status: 'in_progress', priority: 'medium', title: 'Case 3' },
    { id: '4', status: 'closed', priority: 'low', title: 'Case 4' },
    { id: '5', status: 'on_hold', priority: 'medium', title: 'Case 5' },
  ];

  describe('Affichage initial', () => {
    it('devrait afficher le titre des statistiques', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      expect(wrapper.text()).toContain('Statistiques visuelles');
    });

    it('devrait être replié par défaut', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      expect((wrapper.vm as any).isExpanded).toBe(false);
    });

    it('devrait afficher l\'icône de dépliage', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const icon = wrapper.find('svg.rotate-180, svg:not(.rotate-180)');
      expect(icon.exists()).toBe(true);
    });
  });

  describe('Interaction d\'expansion', () => {
    it('devrait se déplier au clic sur le bouton', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.vm.isExpanded).toBe(true);
    });

    it('devrait afficher les statistiques quand déplié', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Répartition par statut');
      expect(wrapper.text()).toContain('Répartition par priorité');
    });

    it('devrait masquer les statistiques quand replié', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      await wrapper.find('button').trigger('click');

      expect(wrapper.vm.isExpanded).toBe(false);
    });

    it('devrait faire pivoter l\'icône lors du dépliage', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const icon = wrapper.find('svg.transition-transform');

      expect(icon.classes()).not.toContain('rotate-180');

      await wrapper.find('button').trigger('click');

      expect(icon.classes()).toContain('rotate-180');
    });
  });

  describe('Statistiques de statut', () => {
    it('devrait calculer correctement les statistiques de statut', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const statusStats = wrapper.vm.statusStats;

      expect(statusStats.find((s: any) => s.key === 'pending')?.count).toBe(1);
      expect(statusStats.find((s: any) => s.key === 'in_progress')?.count).toBe(2);
      expect(statusStats.find((s: any) => s.key === 'on_hold')?.count).toBe(1);
      expect(statusStats.find((s: any) => s.key === 'closed')?.count).toBe(1);
    });

    it('devrait calculer les pourcentages correctement', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const statusStats = wrapper.vm.statusStats;
      const pending = statusStats.find((s: any) => s.key === 'pending');
      const inProgress = statusStats.find((s: any) => s.key === 'in_progress');

      expect(pending?.percentage).toBe(20);
      expect(inProgress?.percentage).toBe(40);
    });

    it('devrait afficher les labels de statut', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('En attente');
      expect(wrapper.text()).toContain('En cours');
      expect(wrapper.text()).toContain('En pause');
      expect(wrapper.text()).toContain('Fermé');
    });

    it('devrait afficher les compteurs de statut', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain('1 (20%)');
      expect(wrapper.html()).toContain('2 (40%)');
    });

    it('devrait appliquer les bonnes couleurs aux barres de progression', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      const progressBars = wrapper.findAll('.bg-yellow-500, .bg-indigo-500, .bg-gray-500, .bg-green-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Statistiques de priorité', () => {
    it('devrait calculer correctement les statistiques de priorité', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const priorityStats = wrapper.vm.priorityStats;

      expect(priorityStats.find((p: any) => p.key === 'urgent')?.count).toBe(1);
      expect(priorityStats.find((p: any) => p.key === 'high')?.count).toBe(1);
      expect(priorityStats.find((p: any) => p.key === 'medium')?.count).toBe(2);
      expect(priorityStats.find((p: any) => p.key === 'low')?.count).toBe(1);
    });

    it('devrait calculer les pourcentages de priorité', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const priorityStats = wrapper.vm.priorityStats;
      const medium = priorityStats.find((p: any) => p.key === 'medium');

      expect(medium?.percentage).toBe(40); // 2/5 = 40%
    });

    it('devrait afficher les labels de priorité', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      wrapper.vm.isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Urgente');
      expect(wrapper.text()).toContain('Élevée');
      expect(wrapper.text()).toContain('Moyenne');
      expect(wrapper.text()).toContain('Faible');
    });
  });

  describe('Taux de complétion', () => {
    it('devrait calculer le taux de complétion', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      expect(wrapper.vm.completionRate).toBe(20);
    });

    it('devrait gérer 100% de complétion', () => {
      const allClosedCases = [
        { id: '1', status: 'closed', priority: 'low' },
        { id: '2', status: 'closed', priority: 'low' },
      ];

      const wrapper = mount(CaseStats, {
        props: { cases: allClosedCases },
      });

      expect(wrapper.vm.completionRate).toBe(100);
    });

    it('devrait gérer 0% de complétion', () => {
      const noClosed = [
        { id: '1', status: 'pending', priority: 'urgent' },
        { id: '2', status: 'in_progress', priority: 'high' },
      ];

      const wrapper = mount(CaseStats, {
        props: { cases: noClosed },
      });

      expect(wrapper.vm.completionRate).toBe(0);
    });
  });

  describe('Compteur de cas urgents', () => {
    it('devrait compter les cas urgents', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      expect(wrapper.vm.urgentCount).toBe(1);
    });

    it('devrait gérer l\'absence de cas urgents', () => {
      const noUrgent = [
        { id: '1', status: 'pending', priority: 'low' },
        { id: '2', status: 'in_progress', priority: 'medium' },
      ];

      const wrapper = mount(CaseStats, {
        props: { cases: noUrgent },
      });

      expect(wrapper.vm.urgentCount).toBe(0);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un tableau vide', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: [] },
      });

      const statusStats = (wrapper.vm as any).statusStats;
      statusStats.forEach((stat: any) => {
        expect(stat.count).toBe(0);
      });
    });

    it('devrait éviter la division par zéro avec un tableau vide', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: [] },
      });

      const statusStats = (wrapper.vm as any).statusStats;
      statusStats.forEach((stat: any) => {
        expect(stat.percentage).toBe(0);
      });
    });

    it('devrait gérer un seul cas', () => {
      const wrapper = mount(CaseStats, {
        props: {
          cases: [{ id: '1', status: 'pending', priority: 'urgent' }],
        },
      });

      const statusStats = (wrapper.vm as any).statusStats;
      const pending = statusStats.find((s: any) => s.key === 'pending');

      expect(pending?.percentage).toBe(100);
    });

    it('devrait gérer un grand nombre de cas', () => {
      const manyCases = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        status: i % 2 === 0 ? 'pending' : 'closed',
        priority: 'medium',
      }));

      const wrapper = mount(CaseStats, {
        props: { cases: manyCases },
      });

      expect((wrapper.vm as any).statusStats).toBeDefined();
      expect((wrapper.vm as any).completionRate).toBe(50);
    });

    it('devrait gérer des statuts inconnus gracieusement', () => {
      const unknownStatus = [
        { id: '1', status: 'unknown_status', priority: 'medium' },
      ];

      const wrapper = mount(CaseStats, {
        props: { cases: unknownStatus },
      });

      const statusStats = (wrapper.vm as any).statusStats;
      statusStats.forEach((stat: any) => {
        expect(stat.count).toBe(0);
      });
    });
  });

  describe('Responsive et animations', () => {
    it('devrait avoir des classes d\'animation de transition', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      (wrapper.vm as any).isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain('transition');
    });

    it('devrait avoir des classes hover sur le bouton', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('hover:bg-gray-100');
    });

    it('devrait avoir des barres de progression animées', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      (wrapper.vm as any).isExpanded = true;
      await wrapper.vm.$nextTick();

      const progressBars = wrapper.findAll('.transition-all');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un bouton accessible', () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('devrait utiliser des couleurs contrastées', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: mockCases },
      });

      (wrapper.vm as any).isExpanded = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain('text-gray-700');
      expect(wrapper.html()).toContain('text-gray-900');
    });
  });

  describe('Propriétés calculées réactives', () => {
    it('devrait mettre à jour les stats quand cases change', async () => {
      const wrapper = mount(CaseStats, {
        props: { cases: [{ id: '1', status: 'pending', priority: 'urgent' }] },
      });

      expect((wrapper.vm as any).statusStats.find((s: any) => s.key === 'pending')?.count).toBe(1);

      await wrapper.setProps({
        cases: [
          { id: '1', status: 'pending', priority: 'urgent' },
          { id: '2', status: 'pending', priority: 'high' },
        ],
      });

      expect((wrapper.vm as any).statusStats.find((s: any) => s.key === 'pending')?.count).toBe(2);
    });
  });
});