import { config } from 'dotenv';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'template_marketplace',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true',
});

async function seedCompanyIdentity() {
  try {
    console.log('🌱 Seeding company identity...');

    // Update company identity
    const identity = await sql`
      UPDATE company_identity
      SET
        name = 'Korex',
        tagline = 'Professional Template Marketplace',
        description = 'Premium website templates designed for ambitious creators and entrepreneurs. Full visual control, instant deployment, and lifetime updates.',
        primary_color = '#FF6B35',
        secondary_color = '#004E89',
        accent_color = '#F7931E',
        email = 'support@korex.studio',
        phone = '+62 (XXX) XXXX',
        website = 'https://korex.studio',
        founded_year = 2024,
        team_size = 'Small Team',
        mission = 'Empower creators and entrepreneurs with beautifully designed, fully customizable website templates that help them launch and grow their businesses.',
        values = 'Quality Craftsmanship, Transparency, Creator Community, Innovation',
        social_links = jsonb_build_object(
          'twitter', 'https://twitter.com/korex_studio',
          'linkedin', 'https://linkedin.com/company/korex',
          'instagram', 'https://instagram.com/korex_studio',
          'github', 'https://github.com/korex'
        )
      WHERE id IS NOT NULL
      RETURNING *;
    `;

    console.log('✅ Company identity seeded:', identity[0].name);

    console.log('✅ Company identity seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding company identity:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedCompanyIdentity();
