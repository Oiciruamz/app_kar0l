# 🩺 Imágenes de Doctores Profesionales

Este proyecto ahora incluye imágenes reales de doctores profesionales obtenidas de Unsplash, reemplazando los avatares genéricos anteriores.

## 📸 Fuente de Imágenes

Las imágenes provienen de **Unsplash**, una plataforma de fotografía gratuita que ofrece:
- ✅ Imágenes de alta calidad
- ✅ Licencia gratuita para uso comercial
- ✅ Fotos reales de profesionales médicos
- ✅ Optimización automática de tamaño

## 🔧 Implementación

### Servicio de Imágenes (`lib/services/doctorImages.ts`)

```typescript
import { getDoctorImageBySpecialty, getRandomDoctorImage } from '@/lib/services/doctorImages';

// Obtener imagen por especialidad
const imageUrl = getDoctorImageBySpecialty('Odontología General');

// Obtener imagen aleatoria
const randomImage = getRandomDoctorImage();
```

### Componente DoctorAvatar (`components/DoctorAvatar.tsx`)

```tsx
import { DoctorAvatar } from '@/components/DoctorAvatar';

<DoctorAvatar 
  doctor={doctorData} 
  size={120} 
/>
```

## 🚀 Actualización de Base de Datos

### Para Doctores Nuevos
El script `scripts/seedDatabase.js` ya está configurado para usar las nuevas imágenes automáticamente.

### Para Doctores Existentes
Ejecuta el script de actualización:

```bash
node scripts/updateDoctorImages.js
```

Este script:
- ✅ Busca todos los doctores en la base de datos
- ✅ Asigna imágenes apropiadas según su especialidad
- ✅ Actualiza el campo `photoURL` en Firestore
- ✅ Mantiene la información existente intacta

## 🎯 Especialidades Soportadas

| Especialidad | Imagen Asignada |
|-------------|----------------|
| Odontología General | Imagen 1 |
| Ortodoncia | Imagen 4 |
| Endodoncia | Imagen 6 |
| Periodoncia | Imagen 8 |
| Cirugía Maxilofacial | Imagen 10 |
| Odontopediatría | Imagen 12 |

## 🔄 URLs de Imágenes

Las imágenes están optimizadas con parámetros de Unsplash:
- **Tamaño**: 400x400 píxeles
- **Formato**: Crop automático enfocado en el rostro
- **Calidad**: Alta resolución

Ejemplo de URL:
```
https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face
```

## 📱 Uso en la Aplicación

### DoctorCard Component
```tsx
// El componente ya está configurado para mostrar las nuevas imágenes
<DoctorCard doctor={doctor} onPress={handlePress} />
```

### Doctor Profile Screen
```tsx
// La pantalla de perfil mostrará automáticamente las nuevas imágenes
<Image source={{ uri: doctor.photoURL }} style={styles.doctorPhoto} />
```

## 🛠️ Personalización

### Agregar Nuevas Imágenes
1. Edita `lib/services/doctorImages.ts`
2. Agrega nuevas URLs al array `DOCTOR_IMAGES`
3. Actualiza el mapeo de especialidades si es necesario

### Cambiar Tamaño de Imágenes
```typescript
// Usar la función de optimización
const optimizedUrl = optimizeDoctorImageUrl(imageUrl, 300, 300);
```

## ✅ Beneficios

- **Profesionalismo**: Imágenes reales de doctores profesionales
- **Consistencia**: Todas las imágenes siguen el mismo estilo
- **Calidad**: Imágenes de alta resolución optimizadas
- **Licencia**: Uso gratuito sin restricciones
- **Mantenimiento**: Fácil actualización y gestión

## 🔍 Verificación

Para verificar que las imágenes se están cargando correctamente:

1. Ejecuta la aplicación
2. Navega a la lista de doctores
3. Verifica que se muestren las nuevas imágenes profesionales
4. Revisa los perfiles individuales de doctores

## 📝 Notas Importantes

- Las imágenes se cargan desde Unsplash, requiere conexión a internet
- Se recomienda implementar un sistema de caché para mejor rendimiento
- Las imágenes están optimizadas para dispositivos móviles
- Compatible con React Native y Expo

