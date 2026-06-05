export function setToken(token) {
  localStorage.setItem('yukti_admin_token', token);
}
export function getToken() {
  return localStorage.getItem('yukti_admin_token');
}
export function clearToken() {
  localStorage.removeItem('yukti_admin_token');
}
