# 🎟️ TicketHub v2.0

**Plataforma completa de gestión de eventos y venta de entradas**

![Version](https://img.shields.io/badge/version-2.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14+-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Características

### 🔐 Autenticación Completa
- ✅ Login/Registro con Supabase Auth
- ✅ Sesión persistente con SSR
- ✅ Middleware global de sincronización
- ✅ Control de acceso basado en roles (RBAC)

### 👥 3 Roles Optimizados

#### 👤 Usuario (Cliente)
- Explorar cartelera de eventos
- Ver detalles y disponibilidad
- Comprar entradas (próximamente)
- Historial de compras

#### 🎭 Organizador
- Crear y gestionar eventos
- Ver métricas en tiempo real
- Track de ventas y ingresos
- Dashboard personalizado

#### 👨‍💼 Admin
- Supervisar plataforma completa
- Métricas globales
- Gestionar usuarios y eventos
- Panel administrativo

### 🎨 Interfaz Moderna
- Dark glass-morphism design
- 100% Responsive (Móvil/Tablet/Desktop)
- Animaciones suaves
- Accesibilidad WCAG

### ⚡ Rendimiento
- Server Components para SSR
- Índices SQL optimizados
- Vistas precalculadas de métricas
- Lazy loading de componentes

### 🔒 Seguridad
- Row Level Security (RLS) en BD
- Validación servidor-cliente
- Server Actions para operaciones sensibles
- Protección de datos sensibles

---

## 🚀 Quick Start

### 1. Preparar Supabase (2 min)

```bash
# En https://supabase.com
# 1. Abre SQL Editor
# 2. Copia: supabase/vistas_optimizadas.sql
# 3. Ejecuta el script
```

### 2. Instalar Localmente

```bash
cd TicketHub
npm install
npm run dev
```

### 3. Probar

```bash
# Abre http://localhost:3000
# Registra tu usuario
# ¡Listo! 🎉
```

### ⏱️ Tiempo total: ~5 minutos

---

## 📁 Estructura del Proyecto

```
TicketHub/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Server Component orquestador
│   │   ├── layout.tsx            # Layout global + PWA
│   │   ├── actions.ts            # Server Actions (auth)
│   │   └── middleware.ts         # Sincronización sesión
│   │
│   ├── components/
│   │   ├── LoginForm.tsx         # Autenticación UI
│   │   ├── DashboardAdmin.tsx    # Panel admin
│   │   ├── DashboardOrganizador.tsx # Panel organizador
│   │   ├── DashboardUsuario.tsx  # Cartelera usuario
│   │   ├── TarjetaEvento.tsx     # Evento card
│   │   └── ui/
│   │       └── glassStyles.ts    # Design system
│   │
│   └── utils/supabase/
│       ├── server.ts             # Cliente servidor
│       ├── client.ts             # Cliente navegador
│       └── middleware.ts         # Cliente middleware
│
├── supabase/
│   ├── schema.sql                # Definición de tablas
│   └── vistas_optimizadas.sql    # Vistas y funciones
│
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons
│
└── 📚 Documentación/
    ├── QUICK_START.md            # Inicio rápido
    ├── DEPLOYMENT.md             # Guía deployment
    ├── REFERENCIA_TECNICA.md     # Referencia técnica
    ├── TESTING.md                # Casos de prueba
    └── RESUMEN_EJECUTIVO.md      # Resumen ejecutivo
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14+** - React framework moderno
- **React 18.3** - Server + Client Components
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling responsivo
- **PWA Support** - Offline capability

### Backend
- **Supabase** - PostgreSQL + Auth + Real-time
- **Server Actions** - Form submissions seguras
- **Middleware Next.js** - Sesión global

### Deployment
- **Vercel** (recomendado)
- **Docker** compatible
- **Edge Functions** ready

---

## 📊 Base de Datos

### Tablas Principales

```sql
perfiles
├── id (UUID)
├── correo (email único)
├── nombre_completo (text)
└── rol (admin | organizador | usuario)

eventos
├── id (UUID)
├── titulo, descripcion, categoria
├── ubicacion, fecha, precio
├── entradas_disponibles, total_entradas
└── creado_por (FK → perfiles)

entradas
├── id (UUID)
├── evento_id (FK → eventos)
├── usuario_id (FK → perfiles)
├── estado (pagada | pendiente | cancelada)
└── timestamps
```

### Vistas SQL

```sql
metricas_organizador   -- Estadísticas por organizador
metricas_admin         -- Métricas globales
obtener_metricas_*()   -- Funciones helper
```

---

## 🔄 Flujos de Autenticación

```
┌─ Usuario sin sesión
│
├─ Muestra LoginForm
│  ├─ Registrarse → registerAction
│  │  ├─ Crear en Auth
│  │  ├─ Crear perfil (rol='usuario')
│  │  └─ Redirige a Dashboard
│  │
│  └─ Iniciar Sesión → loginAction
│     ├─ Autenticar en Auth
│     ├─ Obtener perfil
│     └─ Redirige según rol
│
└─ Usuario con sesión
   │
   ├─ Rol 'usuario' → DashboardUsuario
   ├─ Rol 'organizador' → DashboardOrganizador
   └─ Rol 'admin' → DashboardAdmin
```

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario**: Violeta → Índigo (gradiente)
- **Fondo**: Oscuro (#0B0F19 → #111827)
- **Secundarios**: Rojo, Verde, Azul
- **Texto**: Blanco, Grises

### Componentes
- **Glass Panels**: Blur + Border blanca 10%
- **Botones**: Gradiente violeta con shadow
- **Cards**: Hover effects suave
- **Inputs**: Glass effect transparente

---

## 📱 Responsive Design

| Breakpoint | Ancho | Columnas |
|------------|-------|----------|
| Mobile | < 640px | 1 |
| Tablet | 640-1024px | 2-3 |
| Desktop | > 1024px | 3-4 |

---

## 🔒 Seguridad

✅ **Autenticación**
- Supabase Auth con JWT
- Sesión persistente

✅ **Autorización**
- RLS en todas las tablas
- Validación de roles
- Server Actions únicamente

✅ **Data Privacy**
- Cifrado en tránsito (HTTPS)
- Usuarios aislados por perfil
- GDPR compliance ready

---

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| [QUICK_START.md](./QUICK_START.md) | Inicio rápido en 5 min |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guía step-by-step |
| [REFERENCIA_TECNICA.md](./REFERENCIA_TECNICA.md) | Ref técnica completa |
| [TESTING.md](./TESTING.md) | Casos de prueba |
| [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) | Overview ejecutivo |

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t tickethub .
docker run -p 3000:3000 tickethub
```

### Supabase Project
```bash
supabase start
supabase db push
```

---

## 🧪 Testing

```bash
# Ver TESTING.md para casos completos

# Tests rápidos
npm run dev          # Inicio server
npm run build        # Validar build
npm run lint         # Verificar código
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Componentes | 6 |
| Server Actions | 3 |
| Tablas BD | 3 |
| Vistas SQL | 2 |
| Líneas de código | ~1,200 |
| % Responsivo | 100% |
| Seguridad | RLS + Auth |

---

## 🛣️ Roadmap

### v2.1 (Próximo)
- [ ] Integración Stripe
- [ ] Email notifications
- [ ] Búsqueda avanzada

### v2.5
- [ ] Reseñas y ratings
- [ ] Sistema de refunds
- [ ] Analytics mejorado

### v3.0
- [ ] App móvil (React Native)
- [ ] Pagos alternativos (PayPal)
- [ ] Multi-idioma

---

## ❓ FAQ

**¿Cómo creo un evento?**
Loguearse como organizador → Dashboard → Botón "+ Nuevo Evento"

**¿Cómo compro una entrada?**
Loguearse como usuario → Ver evento → Botón "Comprar" (próximamente)

**¿Puedo tener múltiples roles?**
No, cada usuario tiene un rol. Crear múltiples cuentas si es necesario.

**¿Dónde están mis datos?**
En Supabase PostgreSQL database. Consulta REFERENCIA_TECNICA.md

**¿Es seguro?**
Sí, usa Supabase Auth + RLS + HTTPS + Validación servidor.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

---

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

## 📞 Soporte

- 📧 Email: support@tickethub.dev
- 💬 Issues: [GitHub Issues](https://github.com/tickethub/issues)
- 📚 Docs: [Documentación Completa](./DEPLOYMENT.md)

---

## 🙏 Agradecimientos

- Next.js team por App Router
- Supabase por PostgreSQL + Auth
- Tailwind CSS por utilidades
- React team por Server Components

---

## 📝 Changelog

### v2.0 (Actual)
- ✅ Autenticación completa SSR
- ✅ 3 roles RBAC
- ✅ 3 dashboards optimizados
- ✅ Base de datos relacional
- ✅ Documentación técnica

### v1.0 (Teórico)
- Estructura inicial

---

**TicketHub v2.0** | Producción Ready | 1 Junio 2026

```
         Ticket  Hub
           ↓      ↓
        Blanco  Gradiente
```

---

## 🚀 ¡Comienza Ahora!

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

**Happy Ticketing! 🎉**
