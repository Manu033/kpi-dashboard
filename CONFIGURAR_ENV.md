# ⚙️ CONFIGURAR CREDENCIALES SQL SERVER

## El problema
El backend necesita conectarse a tu base de datos SQL Server. Se requiere un archivo `.env` con las credenciales.

---

## Solución

### 1. Archivo `.env` ya creado
Se ha creado el archivo: `backend/.env`

Edítalo con tus credenciales reales:

```
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourPassword123!
SQLSERVER_DB=kpi_softprod
PORT=3001
```

---

## 📋 Valores a Configurar

### `SQLSERVER_HOST`
- **Localhost**: `localhost` (para desarrollo local)
- **IP específica**: `192.168.1.100`
- **Nombre del servidor**: `SERVIDOR\SQLEXPRESS`

### `SQLSERVER_PORT`
- **Por defecto**: `1433`
- Generalmente no necesita cambiar

### `SQLSERVER_USER`
Depende de tu instalación SQL Server:

**Si usas autenticación SQL:**
- Usuario estándar: `sa` (Admin)
- Usuario customizado: nombre que creaste

**Si usas autenticación Windows:**
- Usa: `domain\username` o solo el usuario

### `SQLSERVER_PASSWORD`
- La contraseña de tu usuario SQL Server
- ⚠️ No usar caracteres especiales complejos si no estás seguro

### `SQLSERVER_DB`
- Nombre de la BD: `kpi_softprod`
- Es el que creó `schema.sql`

---

## 🔍 Cómo Encontrar tus Credenciales

### En SQL Server Management Studio:
1. Abre SSMS
2. Conecta a tu servidor
3. En el Object Explorer, verás el nombre del servidor
4. Haz clic derecho en el servidor → Properties
5. Busca "Server name" y "Authentication mode"

### Para encontrar el puerto:
```sql
-- Ejecuta en SQL Server
SELECT @@version;
EXEC xp_regread 'HKEY_LOCAL_MACHINE', 'SOFTWARE\Microsoft\MSSQLServer\MSSQLServer\CurrentVersion', 'CurrentVersion';
```

---

## ✅ Después de Editar `.env`

1. Guarda el archivo
2. Reinicia el backend:
```bash
cd backend
npm run dev
```

Deberías ver:
```
API listening on http://localhost:3001
Database connection pool created successfully
```

---

## 🚨 Errores Comunes

### Error: "Database 'kpi_softprod' does not exist"
**Solución**: Ejecuta primero `sql/schema.sql` en SQL Server

### Error: "Login failed for user 'sa'"
**Solución**: 
- Verifica que el usuario existe
- Verifica contraseña (case-sensitive)
- Verifica modo autenticación (SQL vs Windows)

### Error: "Cannot open server 'localhost'"
**Solución**:
- SQL Server no está corriendo
- Host/puerto incorrecto
- Firewall bloqueando

---

## 🔐 Nota de Seguridad

**NUNCA** commitees `.env` a Git con contraseñas reales. Ya existe `.gitignore` que lo previene.

Para producción, usa secretos de ambiente o Azure Key Vault.

---

## ✨ Próximo Paso

Una vez configurado correctamente, ejecuta:

```bash
npm run dev
```

Y abre el frontend en navegador. Los datos deberían cargar.
