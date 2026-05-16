export interface IAuthRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  result: string;
  token: string;
  refreshToken: string;
}
