export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
