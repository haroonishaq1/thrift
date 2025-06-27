const { pool } = require('./src/config/database');

// Add logo column to brands table
const addBrandLogoColumn = async () => {
  try {
    console.log('🔧 Adding logo column to brands table...');
    
    // Add logo column
    await pool.query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)
    `);
    
    console.log('✅ Logo column added to brands table successfully');
    
  } catch (error) {
    console.error('❌ Error adding logo column:', error.message);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await addBrandLogoColumn();
    console.log('🎉 Logo migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Logo migration failed:', error);
    process.exit(1);
  }
};

main();
