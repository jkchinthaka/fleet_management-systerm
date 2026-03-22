import { mongoAuthService } from './mongoAuthService.js';

const normalizeMongoUser = (user) => ({
  id: user.id,
  full_name: user.name,
  email: user.email,
  role_id: user.roleId,
  role_name: user.roleName
});

export const authService = {
  async register(payload) {
    const data = await mongoAuthService.register({
      name: payload.full_name,
      email: payload.email,
      password: payload.password,
      roleId: payload.role_id
    });

    return {
      user: normalizeMongoUser(data.user),
      token: data.token
    };
  },

  async login(payload) {
    const data = await mongoAuthService.login({
      email: payload.email,
      password: payload.password
    });

    return {
      user: normalizeMongoUser(data.user),
      token: data.token
    };
  }
};
