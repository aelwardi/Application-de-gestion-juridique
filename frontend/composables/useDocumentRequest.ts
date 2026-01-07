export default function useDocumentRequest() {
  const { apiFetch } = useApi();

  /**
   * Créer une demande de documents
   */
  const createDocumentRequest = async (data: {
    case_id: string;
    client_id: string;
    title: string;
    description?: string;
    document_types?: string[];
    expires_in_days?: number;
  }) => {
    return await apiFetch('/document-requests', {
      method: 'POST',
      body: data
    });
  };

  /**
   * Récupérer les demandes pour un dossier
   */
  const getDocumentRequestsByCase = async (caseId: string) => {
    return await apiFetch(`/document-requests/case/${caseId}`);
  };

  /**
   * Mettre à jour le statut d'une demande
   */
  const updateDocumentRequestStatus = async (requestId: string, status: 'completed' | 'cancelled') => {
    return await apiFetch(`/document-requests/${requestId}/status`, {
      method: 'PATCH',
      body: { status }
    });
  };

  /**
   * Supprimer une demande
   */
  const deleteDocumentRequest = async (requestId: string) => {
    return await apiFetch(`/document-requests/${requestId}`, {
      method: 'DELETE'
    });
  };

  return {
    createDocumentRequest,
    getDocumentRequestsByCase,
    updateDocumentRequestStatus,
    deleteDocumentRequest
  };
};