# Script de Configuración de Notas del Doctor

Este script configura la colección `doctorNotes` en Firebase Firestore para que los doctores puedan almacenar sus notas personales.

## 🚀 Uso Rápido

```bash
# Navegar al directorio de scripts
cd scripts

# Instalar dependencias (si no están instaladas)
npm install

# Ejecutar el script de configuración
npm run setup-notes
```

## 📋 Qué hace el script

1. **Verifica la configuración**: Comprueba que existan doctores en la base de datos
2. **Crea notas de ejemplo**: Agrega algunas notas de muestra para el primer doctor encontrado
3. **Valida la configuración**: Verifica que todo esté funcionando correctamente

## 🔧 Configuración Manual

Si prefieres configurar manualmente:

### 1. Desplegar reglas e índices de Firestore
```bash
# Desplegar todo (reglas + índices)
firebase deploy --only firestore

# O desplegar por separado
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. Verificar configuración en Firebase Console
- Ve a Firebase Console > Firestore Database > Rules
- Asegúrate de que las reglas incluyan la sección `doctorNotes`
- Ve a Firebase Console > Firestore Database > Indexes
- Verifica que exista el índice para `doctorNotes` con campos `doctorId` y `updatedAt`

### 3. Crear colección manualmente
- Ve a Firebase Console > Firestore Database > Data
- Crea una nueva colección llamada `doctorNotes`
- Los documentos se crearán automáticamente cuando los doctores usen la app

## 📝 Estructura de las Notas

Cada nota tiene la siguiente estructura:

```javascript
{
  id: "auto-generated-id",
  doctorId: "uid-del-doctor",
  title: "Título de la nota",
  content: "Contenido de la nota",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔍 Índices de Firestore

La aplicación necesita un índice específico para consultar las notas del doctor:

```json
{
  "collectionGroup": "doctorNotes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "doctorId", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
}
```

Este índice permite:
- ✅ Filtrar notas por `doctorId` (solo las notas del doctor actual)
- ✅ Ordenar por `updatedAt` descendente (notas más recientes primero)

## 🔒 Seguridad

Las reglas de Firestore garantizan que:
- ✅ Solo doctores autenticados pueden acceder a las notas
- ✅ Los doctores solo pueden ver/modificar sus propias notas
- ✅ Los pacientes no pueden acceder a las notas de los doctores
- ✅ Todas las operaciones requieren autenticación

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"
1. Verifica que las reglas de Firestore estén desplegadas
2. Ejecuta: `firebase deploy --only firestore:rules`
3. Verifica que el usuario esté autenticado como doctor

### Error: "Collection doesn't exist"
1. Ejecuta el script: `npm run setup-notes`
2. O crea manualmente la colección en Firebase Console

### Error: "No doctors found"
1. Ejecuta primero: `npm run seed`
2. Esto creará doctores de prueba en la base de datos

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Firebase esté configurado correctamente
2. Revisa los logs de la consola de Firebase
3. Asegúrate de que `serviceAccountKey.json` esté en la raíz del proyecto
