import { useUserStore } from '@/core/store/useUserStore';

export const useHomeViewModel = () => {
  const user = useUserStore((state) => state.user);

  return {
    isSignedIn: Boolean(user?.email),
    userName: user?.name || user?.email || '',
  };
};
