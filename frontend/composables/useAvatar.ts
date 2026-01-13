export const useAvatar = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl; // Ex: http://localhost:3000/api
  const { apiFetch } = useApi();

  /**
   * Génère l'URL complète pour afficher un avatar
   */
  const getAvatarUrl = (profilePictureUrl: string | null | undefined): string => {
    if (!profilePictureUrl) {
      return '/images/default-avatar.png';
    }

    if (profilePictureUrl.startsWith('http')) {
      return profilePictureUrl;
    }

    const cleanPath = profilePictureUrl.startsWith('/')
      ? profilePictureUrl.substring(1)
      : profilePictureUrl;

    return `${baseURL}/${cleanPath}`;
  };

  /**
   * Upload avatar image
   */
  const uploadAvatar = async (formData: FormData) => {
    return await apiFetch('/users/avatar', {
      method: 'POST',
      body: formData,
    });
  };

  /**
   * Delete avatar image
   */
  const deleteAvatar = async () => {
    return await apiFetch('/users/avatar', {
      method: 'DELETE',
    });
  };

  /**
   * Generate a default avatar with initials
   */
  const getDefaultAvatar = (firstName: string, lastName: string): string => {
    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    const initials = `${firstInitial}${lastInitial}` || '?';

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#6366f1"/>
        <text x="50" y="50" text-anchor="middle" dy=".35em" fill="white" font-family="Arial" font-size="40">${initials}</text>
      </svg>
    `)}`;
  };

  return {
    getAvatarUrl,
    uploadAvatar,
    deleteAvatar,
    getDefaultAvatar,
  };
};