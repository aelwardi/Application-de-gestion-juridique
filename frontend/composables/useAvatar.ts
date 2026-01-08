export const useAvatar = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl; // Ex: http://localhost:3000/api

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

    const fullUrl = `${baseURL}/avatars/${profilePictureUrl}`;
    return fullUrl;
  };

  return {
    getAvatarUrl,
  };
};