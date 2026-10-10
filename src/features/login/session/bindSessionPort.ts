import { registerSessionPort } from '@/core/session/sessionPort';
import { LoginService } from '@/features/login/domain/loginService';

let bound = false;

/** Idempotent: registers the session implementation from `features/login`. */
export function bindLoginSessionPort(): void {
  if (bound) return;
  bound = true;

  const service = new LoginService();

  registerSessionPort({
    async revalidateCurrentUser() {
      return service.getConnectedUser();
    },
    async logout() {
      await service.logout();
    },
  });
}
