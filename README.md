# Template Marketplace Platform

Multi-tenant template marketplace dengan sistem full customization untuk User, Contributor, dan Admin.

## 🎯 Features

### 3 User Roles
- **User**: Browse, purchase, dan customize templates
- **Contributor**: Create dan publish templates
- **Admin**: Manage users, templates, domains, dan system

### Template System
- Dynamic folder-based templates
- 17+ editable slot types untuk full customization
- Custom domain dan subdomain routing
- Multi-page support dengan dynamic pages

### Full Customization
User bisa edit semua aspek visual:
- Layout variants (centered, split-screen, grid)
- Typography (fonts, sizes, weights)
- Colors, gradients, shadows
- Spacing, sizing, border radius
- Animations dan transitions
- Button styles dan effects

## 📁 Project Structure

```
my-project-templates/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public marketplace
│   │   ├── (admin)/           # Admin dashboard
│   │   ├── (contributor)/     # Contributor dashboard
│   │   ├── (user)/            # User dashboard
│   │   └── api/               # API routes
│   │
│   ├── templates/             # Template repository
│   │   ├── wedding-elegant/   # Example template
│   │   └── shared/            # Shared utilities
│   │
│   ├── lib/
│   │   └── engines/
│   │       ├── template-engine/    # Load & render templates
│   │       ├── editor-engine/      # Visual editors
│   │       ├── domain-engine/      # DNS & routing
│   │       ├── cms/                # Content management
│   │       └── payment/            # Payment processing
│   │
│   ├── components/            # React components
│   └── types/                 # TypeScript types
│
├── scripts/                   # Database migrations
├── tools/                     # Python CLI tools (future)
└── docs/                      # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

1. Clone repository:
```bash
git clone <repo-url>
cd my-project-templates
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment:
```bash
cp .env.example .env
# Edit .env dengan database credentials
```

4. Run migrations:
```bash
npm run db:migrate
```

5. Start dev server:
```bash
npm run dev
```

Visit http://localhost:3000

## 📖 Documentation

Lihat folder `docs/` untuk dokumentasi lengkap:

- [Database Schema](../docs/database-schema.md)
- [Folder Structure](../docs/folder-structure.md)
- [Engine Architecture](../docs/engine-architecture.md)
- [Template System](../docs/template-system.md)
- [Editable Slot Types](../docs/editable-slot-types.md)
- [AI Autopilot Prompts](../docs/ai-autopilot-prompts.md)

## 🎨 Creating Templates

### Method 1: Visual Editor (Future)
Contributor akan bisa create templates via drag & drop canvas editor.

### Method 2: Hardcode (Current)

1. Create folder structure:
```bash
src/templates/{template-slug}/
├── manifest.json       # Template metadata & slots
├── layout.tsx          # Template layout wrapper
├── page.tsx            # Main template page
├── components/         # Template components
│   └── sections/       # Section components
├── types/              # Type definitions
└── lib/                # Utilities
```

2. Define manifest.json dengan editable slots
3. Implement layout.tsx dan page.tsx
4. Create section components dengan useSlotValue hooks
5. Test dengan TemplateRenderer

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, CSS Variables
- **Database**: PostgreSQL with JSONB
- **State**: Zustand (future)
- **UI Components**: Radix UI
- **Tools**: Python CLI (future)

## 🗄️ Database

Schema includes:
- users (role-based access)
- templates (catalog)
- template_purchases
- template_instances (deployed sites)
- template_pages (dynamic pages)
- domains (custom domains)
- earnings (contributor revenue)

Run migrations:
```bash
npm run db:migrate
```

Reset database (⚠️ destructive):
```bash
npm run db:reset
```

## 🎯 Roadmap

### Phase 1: Core System ✅
- [x] Project setup
- [x] Database schema
- [x] Template engine
- [x] First template (wedding-elegant)
- [x] Documentation

### Phase 2: Template System (Current)
- [ ] Template loader optimization
- [ ] More slot types implementation
- [ ] Template validation
- [ ] Preview system

### Phase 3: Editor System
- [ ] User editor UI
- [ ] Contributor canvas editor
- [ ] Slot editor components
- [ ] Live preview

### Phase 4: Domain & Routing
- [ ] Domain verification
- [ ] Subdomain routing
- [ ] Middleware implementation
- [ ] DNS management

### Phase 5: Platform Features
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] User dashboard
- [ ] Contributor dashboard

### Phase 6: Tools & Optimization
- [ ] Python CLI generator
- [ ] Template validator
- [ ] Performance optimization
- [ ] Testing suite

## 🤝 Contributing

1. Read documentation in `docs/`
2. Follow folder structure conventions
3. Use TypeScript strict mode
4. Test templates before submitting
5. Document editable slots in manifest.json

## 📝 License

Private - All rights reserved

---

**Built with ❤️ for KOREK/WEB Project**
