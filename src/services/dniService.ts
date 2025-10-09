// Servicio simplificado para consulta DNI
export const getDNIInfo = async (dni: string) => {
  const response = await fetch(`https://api.factiliza.com/v1/dni/info/${dni}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTYwOSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.smkBTgVIHHGPRSF9kCqRANNFMo42rXPbjpY-t2_02_U'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
