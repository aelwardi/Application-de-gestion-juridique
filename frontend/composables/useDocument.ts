export const useDocument = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const authStore = useAuthStore();

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return headers;
  };


  const uploadDocument = async (formData: FormData): Promise<any> => {
  console.log("Tentative d'upload vers:", `${baseURL}/documents`);
  for (let [key, value] of formData.entries()) {
    console.log(`FormData - ${key}:`, value);
  }

  try {
    const response = await $fetch<any>(`${baseURL}/documents`, {
      method: 'POST',
      headers: { ...getHeaders() },
      body: formData
    });
    return { success: true, data: response.data || response };
  } catch (error: any) {
    console.error('Détails erreur upload:', error);
    return {
      success: false,
      message: error.data?.message || error.message || 'Upload failed',
      error: error
    };
  }
};


const getRecentDocuments = async (lawyerId: string) => {
  return await $fetch<any>(`${baseURL}/documents/lawyer/${lawyerId}`, {
    headers: getHeaders()
  });
};

const getClientDocuments = async (clientId: string, limit: number = 5) => {
  try {
    const response = await $fetch<any>(`${baseURL}/documents/client/${clientId}?limit=${limit}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return Array.isArray(response) ? response : (response.data || []);
  } catch (error: any) {
    console.error('Erreur récupération documents client:', error);
    return [];
  }
};


  const getDocumentsByCase = async (caseId: string): Promise<any[]> => {
    try {
      const response = await $fetch<any>(`${baseURL}/documents/case/${caseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders()
        }
      });
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error: any) {
      console.error('Erreur récupération documents:', error);
      return [];
    }
  };

  const getDocuments = async (filters?: { case_id?: string }): Promise<any> => {
    if (!filters || !filters.case_id) {
      return { success: true, data: [] };
    }

    try {
      const documents = await getDocumentsByCase(filters.case_id);
      return { success: true, data: documents };
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      return { success: false, data: [], message: error.message };
    }
  };


  const deleteDocument = async (documentId: string): Promise<any> => {
    try {
      const response = await $fetch<any>(`${baseURL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders()
        }
      });
      return response;
    } catch (error: any) {
      console.error('Erreur suppression document:', error);
      return {
        success: false,
        message: error.data?.message || error.message || 'Failed to delete document'
      };
    }
  };


  const getDownloadUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${baseURL}/storage/${fileUrl}`;
  };

  return {
    uploadDocument,
    getDocumentsByCase,
    getDocuments,
    deleteDocument,
    getDownloadUrl,
    getRecentDocuments,
    getClientDocuments
  };
};