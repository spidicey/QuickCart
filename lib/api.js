export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  let payload;
  try {
    payload = await response.json();
  } catch (e) {
    throw new Error("Invalid JSON response");
  }

  const success = Boolean(payload && payload.success);
  const message =
    (payload && payload.message) ||
    (response.ok ? "Success" : "Request failed");

  // if (!success) {
  //   const error = new Error(message);
  //   error.statusCode = payload && payload.statusCode;
  //   error.data = payload && payload.data;
  //   throw error;
  // }

  return {
    success: true,
    statusCode: payload.statusCode,
    message: message,
    data: payload.data,
  };
}

export function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
