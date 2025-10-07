// Servicio para obtener imágenes de doctores usando Unsplash API
// Las imágenes son gratuitas y de alta calidad

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
}

// URLs de imágenes de doctores profesionales de Unsplash
// Estas son imágenes reales de doctores en diferentes especialidades
const DOCTOR_IMAGES = [
  // Odontología General
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  
  // Ortodoncia
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  
  // Endodoncia
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  
  // Periodoncia
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  
  // Cirugía Maxilofacial
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  
  // Odontopediatría
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
];

// Imágenes adicionales de doctores profesionales
const ADDITIONAL_DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
];

/**
 * Obtiene una imagen de doctor basada en el índice proporcionado
 * @param index - Índice para seleccionar la imagen
 * @returns URL de la imagen del doctor
 */
export function getDoctorImage(index: number): string {
  const allImages = [...DOCTOR_IMAGES, ...ADDITIONAL_DOCTOR_IMAGES];
  return allImages[index % allImages.length];
}

/**
 * Obtiene una imagen de doctor aleatoria
 * @returns URL de la imagen del doctor
 */
export function getRandomDoctorImage(): string {
  const allImages = [...DOCTOR_IMAGES, ...ADDITIONAL_DOCTOR_IMAGES];
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}

/**
 * Obtiene una imagen de doctor basada en la especialidad
 * @param specialty - Especialidad del doctor
 * @returns URL de la imagen del doctor
 */
export function getDoctorImageBySpecialty(specialty: string): string {
  const specialtyMap: { [key: string]: number } = {
    'Odontología General': 0,
    'Ortodoncia': 3,
    'Endodoncia': 5,
    'Periodoncia': 7,
    'Cirugía Maxilofacial': 9,
    'Odontopediatría': 11,
  };
  
  const index = specialtyMap[specialty] || 0;
  return getDoctorImage(index);
}

/**
 * Obtiene múltiples imágenes de doctores para usar en el seed
 * @param count - Número de imágenes necesarias
 * @returns Array de URLs de imágenes
 */
export function getDoctorImages(count: number): string[] {
  const images: string[] = [];
  const allImages = [...DOCTOR_IMAGES, ...ADDITIONAL_DOCTOR_IMAGES];
  
  for (let i = 0; i < count; i++) {
    images.push(allImages[i % allImages.length]);
  }
  
  return images;
}

/**
 * Genera una URL de imagen de doctor con parámetros específicos
 * @param baseUrl - URL base de la imagen
 * @param width - Ancho deseado (default: 400)
 * @param height - Alto deseado (default: 400)
 * @returns URL optimizada de la imagen
 */
export function optimizeDoctorImageUrl(
  baseUrl: string, 
  width: number = 400, 
  height: number = 400
): string {
  // Si ya tiene parámetros de Unsplash, mantenerlos y agregar los nuestros
  if (baseUrl.includes('?')) {
    return `${baseUrl}&w=${width}&h=${height}&fit=crop&crop=face`;
  }
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&crop=face`;
}
