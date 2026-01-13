export default function useDocumentRequest() {
  const { apiFetch } = useApi();


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
      body: JSON.stringify(data)
    } as any);
  };


  const getDocumentRequestsByCase = async (caseId: string) => {
    return await apiFetch(`/document-requests/case/${caseId}`);
  };


  const updateDocumentRequestStatus = async (requestId: string, status: 'completed' | 'cancelled') => {
    return await apiFetch(`/document-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    } as any);
  };


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