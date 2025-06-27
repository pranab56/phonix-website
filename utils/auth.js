export function isAuthenticated() {
  // In a real app, you'd check cookies/tokens
  const islogin = localStorage.getItem('isLoggedIn');
  if (Boolean(islogin) === true) {
    return true;
  }
  return false;
}