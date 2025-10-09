import { useState } from 'react';

export function useCamera() {
  const [showCamera, setShowCamera] = useState(false);

  const openCamera = () => setShowCamera(true);
  const closeCamera = () => setShowCamera(false);

  return {
    showCamera,
    openCamera,
    closeCamera,
    setShowCamera,
  };
}
