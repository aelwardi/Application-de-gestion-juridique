export const useConflict = () => {
  const { apiFetch } = useApi();

  const checkConflict = async (lawyerId: string, clientId: string) => {
    try {
      const response = await apiFetch<any>(`/conflicts/check?lawyer_id=${lawyerId}&client_id=${clientId}`, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      console.error('Error checking conflict:', error);
      throw error;
    }
  };

  const reportConflict = async (data: {
    lawyer_id: string;
    case_id: string;
    description: string;
  }) => {
    try {
      const response = await apiFetch<any>('/conflicts/report', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error('Error reporting conflict:', error);
      throw error;
    }
  };

  const getConflicts = async (userId?: string) => {
    try {
      const url = userId ? `/conflicts?user_id=${userId}` : '/conflicts';
      const response = await apiFetch<any>(url, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching conflicts:', error);
      return { success: true, data: [] };
    }
  };

  const resolveConflict = async (conflictId: string, resolution?: string) => {
    try {
      const response = await apiFetch<any>(`/conflicts/${conflictId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ resolution }),
      });
      return response;
    } catch (error: any) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  };

  return {
    checkConflict,
    reportConflict,
    getConflicts,
    resolveConflict,
  };
};