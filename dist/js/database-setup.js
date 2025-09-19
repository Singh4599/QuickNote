// Database Setup and Test Script for MediVerse AI
class DatabaseSetup {
  constructor() {
    this.supabase = window.supabaseClient;
  }

  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await this.supabase
        .from('hospitals')
        .select('count')
        .limit(1);
    
      if (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
      }
      
      console.log('✅ Database connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  async createSampleData() {
    try {
      console.log('📊 Creating sample data...');
      
      // Create sample hospitals
      const hospitals = [
        {
          name: "City General Hospital",
          city: "Mumbai",
          address: "123 Medical Street, Mumbai, Maharashtra",
          contact: "+91 98765 43210",
          status: "available"
        },
        {
          name: "Metro Health Center", 
          city: "Delhi",
          address: "456 Health Avenue, New Delhi",
          contact: "+91 98765 12345",
          status: "available"
        },
        {
          name: "Sunshine Medical",
          city: "Bangalore", 
          address: "789 Care Road, Bangalore, Karnataka",
          contact: "+91 98765 67890",
          status: "available"
        }
      ];

      const { data: hospitalData, error: hospitalError } = await this.supabase
        .from('hospitals')
        .upsert(hospitals, { onConflict: 'name' })
        .select();

      if (hospitalError) {
        console.error('❌ Failed to create hospitals:', hospitalError.message);
        return false;
      }

      console.log('✅ Sample hospitals created:', hospitalData?.length || 0);

      // Create sample beds data
      if (hospitalData && hospitalData.length > 0) {
        const bedsData = [];
        hospitalData.forEach(hospital => {
          ['ICU', 'General', 'Emergency'].forEach(type => {
            bedsData.push({
              hospital_id: hospital.id,
              type: type,
              total_count: Math.floor(Math.random() * 50) + 10,
              available_count: Math.floor(Math.random() * 20) + 1
            });
          });
        });

        const { error: bedsError } = await this.supabase
          .from('beds')
          .upsert(bedsData, { onConflict: 'hospital_id,type' });

        if (bedsError) {
          console.error('❌ Failed to create beds:', bedsError.message);
        } else {
          console.log('✅ Sample beds data created');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to create sample data:', error.message);
      return false;
    }
  }

  async setupDatabase() {
    console.log('🚀 Starting database setup...');
    
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      return false;
    }

    const sampleDataOk = await this.createSampleData();
    if (!sampleDataOk) {
      console.warn('⚠️ Sample data creation failed, but connection works');
    }

    console.log('✅ Database setup completed!');
    return true;
  }
}

// Auto-run setup when script loads
document.addEventListener('DOMContentLoaded', async () => {
  if (window.supabaseClient) {
    const dbSetup = new DatabaseSetup();
    await dbSetup.setupDatabase();
  } else {
    console.error('❌ Supabase client not available');
  }
});

// Export for manual use
window.DatabaseSetup = DatabaseSetup;
