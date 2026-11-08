import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Load environment variables
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File not present; continue
  }
}

const sql = postgres(process.env.DATABASE_URL);

async function seed() {
  console.log('🌱 Seeding admin and sample templates...\n');

  try {
    // 1. Create super admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const [admin] = await sql`
      INSERT INTO users (email, password_hash, role, status, username)
      VALUES ('admin@korex.com', ${adminPassword}, 'super_admin', 'active', 'superadmin')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = ${adminPassword}, role = 'super_admin', status = 'active', username = 'superadmin'
      RETURNING *
    `;
    console.log('✅ Super Admin created: admin@korex.com / admin123');

    await sql`
      INSERT INTO users (email, password_hash, role, status, username)
      VALUES ('admin@korek.com', ${adminPassword}, 'super_admin', 'active', 'superadmin_korek')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = ${adminPassword}, role = 'super_admin', status = 'active'
    `;
    console.log('✅ Super Admin alias created: admin@korek.com / admin123');

    // 2. Create contributor
    const contribPassword = await bcrypt.hash('password123', 10);
    
    const [contributor] = await sql`
      INSERT INTO users (email, password_hash, role, status, username)
      VALUES ('contributor@korex.com', ${contribPassword}, 'contributor', 'active', 'johndoe')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = ${contribPassword}, username = 'johndoe'
      RETURNING *
    `;
    console.log('✅ Contributor created: contributor@korex.com / password123');

    // 3. Sample templates with preview images
    const templates = [
      {
        name: 'Wedding Elegant',
        slug: 'wedding-elegant',
        category: 'wedding',
        price: 250000,
        preview_image: '/templates/wedding-elegant/preview.svg',
        description: 'Template pernikahan elegan dengan galeri foto, timeline cerita, dan countdown timer. Cocok untuk undangan digital modern.',
        demo_url: '/demo/wedding-elegant',
        is_featured: true,
        features: JSON.stringify(['Responsive Design', 'Photo Gallery', 'RSVP Form', 'Countdown Timer', 'Love Story Timeline']),
      },
      {
        name: 'Portfolio Creative',
        slug: 'portfolio-creative',
        category: 'portfolio',
        price: 200000,
        preview_image: '/templates/portfolio-creative/preview.svg',
        description: 'Portfolio kreatif untuk designer, fotografer, dan seniman. Menampilkan karya dengan gaya yang modern dan menarik.',
        demo_url: '/demo/portfolio-creative',
        is_featured: true,
        features: JSON.stringify(['Project Showcase', 'Skills Section', 'Contact Form', 'About Me', 'Testimonials']),
      },
    ];

    for (const template of templates) {
      await sql`
        INSERT INTO templates (
          name, slug, contributor_id, category, price, status, type,
          preview_image, description, demo_url, is_featured, features
        )
        VALUES (
          ${template.name},
          ${template.slug},
          ${contributor.id},
          ${template.category},
          ${template.price},
          'approved',
          'hardcode',
          ${template.preview_image},
          ${template.description},
          ${template.demo_url},
          ${template.is_featured},
          ${template.features}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          preview_image = ${template.preview_image},
          description = ${template.description},
          demo_url = ${template.demo_url},
          is_featured = ${template.is_featured},
          features = ${template.features}::jsonb,
          status = 'approved'
      `;
      console.log(`✅ Template: ${template.name}`);
    }

    console.log('\n✨ Seeding complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Super Admin: admin@korex.com / admin123');
    console.log('   Contributor: contributor@korex.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed();
