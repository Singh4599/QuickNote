// Simple Auth for MediVerse AI - With proper email confirmation
const SimpleAuth = {
    currentUser: null,

    // Show message on screen instead of alert
    showMessage(message, type = 'info') {
        // Try to use Toast if available
        if (window.Toast) {
            if (type === 'success') {
                window.Toast.success(message);
            } else if (type === 'error') {
                window.Toast.error(message);
            } else {
                window.Toast.info(message);
            }
        } else {
            // Fallback to creating a simple message div
            const messageDiv = document.createElement('div');
            messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
                type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : type === 'error'
                    ? 'bg-red-100 border border-red-400 text-red-700'
                    : 'bg-blue-100 border border-blue-400 text-blue-700'
            }`;
            messageDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg font-bold">&times;</button>
                </div>
            `;
            document.body.appendChild(messageDiv);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentElement) messageDiv.remove();
            }, 5000);
        }
    },

    // Simple signup with email confirmation
    async signUp(email, password, userData = {}) {
        try {
            console.log('🔄 Starting signup process...');
            
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const role = userData.role || 'patient';
            
            console.log('🔍 Signup - User data received:', userData);
            console.log('🔍 Signup - Role being saved:', role);
            
            this.showMessage('Creating your account...', 'info');
            
            // Use Supabase Auth with email confirmation
            const signupData = {
                email: email.toLowerCase().trim(),
                password: password,
                options: {
                    emailRedirectTo: window.location.origin + '/login.html',
                    data: {
                        full_name: userData.fullName || '',
                        role: role,
                        license_no: userData.licenseNo || '',
                        hospital_name: userData.hospitalName || '',
                        registration_id: userData.registrationId || ''
                    }
                }
            };
            
            console.log('🔍 Signup - Full signup data:', signupData);
            
            const { data, error } = await window.supabaseClient.auth.signUp(signupData);

            if (error) {
                console.error('Supabase signup error:', error);
                this.showMessage(error.message, 'error');
                throw new Error(error.message);
            }

            if (!data.user) {
                throw new Error('Failed to create user account');
            }

            console.log('✅ User created successfully:', data.user.email);
            
            // Show success message with email confirmation info
            const successMessage = data.user.email_confirmed_at 
                ? 'Account created successfully! You can now log in.' 
                : 'Account created! Please check your email and click the confirmation link to activate your account.';
            
            this.showMessage(successMessage, 'success');
            
            return { 
                success: true, 
                message: successMessage,
                user: data.user,
                needsConfirmation: !data.user.email_confirmed_at
            };

        } catch (error) {
            console.error('❌ Signup failed:', error.message);
            this.showMessage(error.message || 'Failed to create account', 'error');
            return { 
                success: false, 
                error: error.message || 'Failed to create account' 
            };
        }
    },

    // Simple login with proper error handling and confirmation check
    async signIn(email, password) {
        try {
            console.log('🔄 Starting login process...');
            
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            this.showMessage('Signing you in...', 'info');

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password: password
            });

            if (error) {
                console.error('Supabase login error:', error);
                
                // Handle specific error cases with user-friendly messages
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Please check your email and click the confirmation link before logging in.';
                } else if (error.message.includes('Too many requests')) {
                    errorMessage = 'Too many login attempts. Please wait a moment and try again.';
                }
                
                this.showMessage(errorMessage, 'error');
                throw new Error(errorMessage);
            }

            if (!data.user) {
                throw new Error('Login failed - no user data received');
            }

            // Check if email is confirmed
            if (!data.user.email_confirmed_at) {
                this.showMessage('Please check your email and click the confirmation link to activate your account.', 'error');
                throw new Error('Email not confirmed. Please check your email and click the confirmation link.');
            }

            this.currentUser = data.user;
            console.log('✅ Login successful:', data.user.email);

            // Get role from user metadata with detailed logging
            const userMetadata = data.user.user_metadata || {};
            const role = userMetadata.role || 'patient';
            
            console.log('🔍 Full user object:', data.user);
            console.log('🔍 User metadata:', userMetadata);
            console.log('🔍 Detected role:', role);
            console.log('🔍 Role type:', typeof role);

            this.showMessage(`Login successful! Redirecting to ${role} dashboard...`, 'success');

            // Redirect based on role with additional logging
            setTimeout(() => {
                console.log('🚀 Redirecting based on role:', role);
                
                // Double-check the role before redirecting
                const finalRole = (role && role.trim().toLowerCase()) || 'patient';
                console.log('🔍 Final role for redirect:', finalRole);
                
                if (finalRole === 'doctor') {
                    console.log('➡️ Redirecting to doctor dashboard');
                    window.location.href = 'doctor-dashboard.html';
                } else if (finalRole === 'hospital') {
                    console.log('➡️ Redirecting to hospital dashboard');
                    window.location.href = 'hospital-dashboard.html';
                } else {
                    console.log('➡️ Redirecting to patient dashboard (default)');
                    window.location.href = 'patient-dashboard.html';
                }
            }, 2000); // Increased timeout to see logs

            return { 
                success: true, 
                message: 'Login successful! Redirecting...',
                user: data.user 
            };

        } catch (error) {
            console.error('❌ Login failed:', error.message);
            this.showMessage(error.message || 'Login failed', 'error');
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Sign out
    async signOut() {
        try {
            await window.supabaseClient.auth.signOut();
            this.currentUser = null;
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    }
};

// Make it globally available
window.SimpleAuth = SimpleAuth;
window.Auth = SimpleAuth; // For backward compatibility

console.log('✅ Simple Auth initialized');
