export const useDocument = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const authStore = useAuthStore();

  // Headers standards pour le JSON
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return headers;
  };

  /**
   * Upload un nouveau document
   * Utilise FormData pour supporter l'envoi de fichier
   */
  const uploadDocument = async (formData: FormData): Promise<any> => {
  console.log("Tentative d'upload vers:", `${baseURL}/documents`);
  // Log du contenu du FormData (astuce pour voir ce qu'il y a dedans)
  for (let [key, value] of formData.entries()) {
    console.log(`FormData - ${key}:`, value);
  }

  try {
    const response = await $fetch<any>(`${baseURL}/documents`, {
      method: 'POST',
      headers: { ...getHeaders() },
      body: formData
    });
    return response;
  } catch (error: any) {
    console.error('Détails erreur 404:', error.response); // Regarde si l'API renvoie un message caché
    throw error;
  }
};


const getRecentDocuments = async (lawyerId: string) => {
  return await $fetch<any>(`${baseURL}/documents/lawyer/${lawyerId}`, {
    headers: getHeaders()
  });
};

  /**
   * Récupère tous les documents d'un dossier spécifique
   */
  const getDocumentsByCase = async (caseId: string): Promise<any[]> => {
    try {
      const response = await $fetch<any>(`${baseURL}/documents/case/${caseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders()
        }
      });
      // On retourne le tableau de données (ajuste selon ta réponse API)
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error: any) {
      console.error('Erreur récupération documents:', error);
      return [];
    }
  };

  /**
   * Supprimer un document
   */
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
      throw error;
    }
  };

  /**
   * Télécharger / Ouvrir le document (URL signée ou directe)
   */
  const getDownloadUrl = (fileUrl: string) => {
    // Si fileUrl est déjà une URL complète
    if (fileUrl.startsWith('http')) return fileUrl;
    // Sinon, on concatène avec la base (dépend de ton stockage)
    return `${baseURL}/storage/${fileUrl}`;
  };

  return {
    uploadDocument,
    getDocumentsByCase,
    deleteDocument,
    getDownloadUrl,
    getRecentDocuments
  };
};