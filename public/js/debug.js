// Debug and Test Script for MediVerse AI
console.log('🔍 Starting MediVerse AI Debug...');

// Test 1: Check if all required globals are loaded
function testGlobals() {
  console.log('📋 Testing Global Variables:');
  
  const globals = [
    { name: 'supabase', value: window.supabase },
    { name: 'supabaseClient', value: window.supabaseClient },
    { name: 'CONFIG', value: window.CONFIG },
    { name: 'Auth', value: window.Auth },
    { name: 'Toast', value: window.Toast },
    { name: 'Loader', value: window.Loader }
  ];
  
  globals.forEach(global => {
    if (global.value) {
      console.log(`✅ ${global.name}: Available`);
    } else {
      console.error(`❌ ${global.name}: Missing`);
    }
  });
}

// Test 2: Check DOM elements
function testDOMElements() {
  console.log('📋 Testing DOM Elements:');
  
  const elements = [
    'card-patient',
    'card-doctor', 
    'card-hospital',
    'patientForm',
    'doctorForm',
    'hospitalForm'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ ${id}: Found`);
    } else {
      console.error(`❌ ${id}: Missing`);
    }
  });
}

// Test 3: Test Supabase connection
async function testSupabaseConnection() {
  console.log('📋 Testing Supabase Connection:');
  
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    // Test basic query
    const { data, error } = await window.supabaseClient
      .from('hospitals')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (err) {
    console.error('❌ Supabase test failed:', err.message);
  }
}

// Test 4: Test Auth functions
function testAuthFunctions() {
  console.log('📋 Testing Auth Functions:');
  
  if (window.Auth) {
    const authMethods = ['signUp', 'signIn', 'signOut', 'getCurrentUser'];
    authMethods.forEach(method => {
      if (typeof window.Auth[method] === 'function') {
        console.log(`✅ Auth.${method}: Available`);
      } else {
        console.error(`❌ Auth.${method}: Missing`);
      }
    });
  } else {
    console.error('❌ Auth object not available');
  }
}

// Test 5: Test role switching
function testRoleSwitching() {
  console.log('📋 Testing Role Switching:');
  
  const roleCards = ['card-patient', 'card-doctor', 'card-hospital'];
  const forms = ['patientForm', 'doctorForm', 'hospitalForm'];
  
  roleCards.forEach(cardId => {
    const card = document.getElementById(cardId);
    if (card) {
      // Test if click event is attached
      const hasClickHandler = card.onclick !== null;
      console.log(`${hasClickHandler ? '✅' : '❌'} ${cardId}: Click handler ${hasClickHandler ? 'attached' : 'missing'}`);
    }
  });
  
  forms.forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      const isVisible = !form.classList.contains('hidden');
      console.log(`${isVisible ? '✅' : '⚪'} ${formId}: ${isVisible ? 'Visible' : 'Hidden'}`);
    }
  });
}

// Run all tests when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🚀 Running MediVerse AI Debug Tests...');
    testGlobals();
    testDOMElements();
    testAuthFunctions();
    testRoleSwitching();
    testSupabaseConnection();
    console.log('✨ Debug tests completed!');
  }, 1000);
});

// Export for manual testing
window.DebugTests = {
  testGlobals,
  testDOMElements,
  testSupabaseConnection,
  testAuthFunctions,
  testRoleSwitching
};
