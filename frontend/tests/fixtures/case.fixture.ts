export const mockCase = {
  id: '789e4567-e89b-12d3-a456-426614174000',
  clientId: '123e4567-e89b-12d3-a456-426614174000',
  lawyerId: '223e4567-e89b-12d3-a456-426614174000',
  title: 'Dossier Contentieux Commercial',
  description: 'Litige contractuel entre sociétés',
  caseNumber: 'DOS-2024-001',
  status: 'open' as const,
  priority: 'high' as const,
  category: 'commercial',
  openedAt: new Date('2024-01-15T00:00:00Z'),
  closedAt: null,
  deadline: new Date('2024-12-31T00:00:00Z'),
  estimatedValue: 50000.00,
  createdAt: new Date('2024-01-15T00:00:00Z'),
  updatedAt: new Date('2024-01-15T00:00:00Z'),
};

export const mockCasesList = [
  mockCase,
  {
    ...mockCase,
    id: '889e4567-e89b-12d3-a456-426614174000',
    title: 'Dossier Droit du Travail',
    caseNumber: 'DOS-2024-002',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    category: 'work_law',
  },
  {
    ...mockCase,
    id: '989e4567-e89b-12d3-a456-426614174000',
    title: 'Dossier Familial',
    caseNumber: 'DOS-2024-003',
    status: 'closed' as const,
    priority: 'low' as const,
    category: 'family',
    closedAt: new Date('2024-03-15T00:00:00Z'),
  },
];

export const mockCreateCaseData = {
  clientId: '123e4567-e89b-12d3-a456-426614174000',
  lawyerId: '223e4567-e89b-12d3-a456-426614174000',
  title: 'Nouveau Dossier',
  description: 'Description du nouveau dossier',
  category: 'commercial',
  priority: 'medium' as const,
  deadline: new Date('2024-12-31T00:00:00Z'),
};

