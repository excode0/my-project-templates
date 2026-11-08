#!/usr/bin/env node
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/template_marketplace'

async function seed() {
  console.log('🌱 Starting database seed...')
  
  const sql = postgres(DATABASE_URL, {
    max: 1,
    onnotice: () => {},
  })

  try {
    // Create admin user
    let [admin] = await sql`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ('admin@platform.com', 'hashed_password', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `

    if (!admin) {
      ;[admin] = await sql`
        SELECT id, email, role FROM users WHERE email = 'admin@platform.com'
      `
      console.log('⏭️  Admin user already exists')
    } else {
      console.log('✅ Created admin user:', admin.email)
    }

    // Create contributor user
    let [contributor] = await sql`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ('contributor@platform.com', 'hashed_password', 'contributor', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `

    if (!contributor) {
      ;[contributor] = await sql`
        SELECT id, email, role FROM users WHERE email = 'contributor@platform.com'
      `
      console.log('⏭️  Contributor user already exists')
    } else {
      console.log('✅ Created contributor user:', contributor.email)
    }

    // Create test user
    const [user] = await sql`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ('user@test.com', 'hashed_password', 'user', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `

    if (user) {
      console.log('✅ Created test user:', user.email)
    } else {
      console.log('⏭️  Test user already exists')
    }

    // Create wedding-elegant template
    const contributorId = contributor?.id || admin?.id
    
    const [template] = await sql`
      INSERT INTO templates (
        name, slug, contributor_id, category, price,
        description, requires_custom_domain, status, type, preview_image
      ) VALUES (
        'Wedding Elegant',
        'wedding-elegant',
        ${contributorId},
        'wedding',
        299000,
        'Template undangan pernikahan elegant dengan full customization. Mendukung 27+ editable slots untuk layout, typography, colors, dan animations.',
        true,
        'approved',
        'hardcode',
        '/templates/wedding-elegant/preview.jpg'
      )
      ON CONFLICT (slug) DO UPDATE SET
        status = 'approved',
        description = EXCLUDED.description
      RETURNING id, name, slug, status
    `
    
    if (template) {
      console.log('✅ Created/Updated template:', template.name, `(${template.slug})`)
    }

    // Create more template categories (future templates)
    const futureTemplates = [
      {
        name: 'Portfolio Creative',
        slug: 'portfolio-creative',
        category: 'portfolio',
        price: 199000,
        description: 'Modern portfolio template for creatives and designers',
        requires_custom_domain: true,
      },
    ]

    for (const tpl of futureTemplates) {
      await sql`
        INSERT INTO templates (
          name, slug, contributor_id, category, price,
          description, requires_custom_domain, status, type
        ) VALUES (
          ${tpl.name},
          ${tpl.slug},
          ${contributorId},
          ${tpl.category},
          ${tpl.price},
          ${tpl.description},
          ${tpl.requires_custom_domain},
          'draft',
          'hardcode'
        )
        ON CONFLICT (slug) DO NOTHING
      `
    }
    
    console.log('✅ Created additional real template entries')

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📝 Summary:')
    console.log('- 3 users created (admin, contributor, user)')
    console.log('- 1 published template (wedding-elegant)')
    console.log('- 1 additional template (portfolio-creative)')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

seed()
