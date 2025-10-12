package com.authentic.smartdoor.authentication.utils

import android.content.Context
import com.authentic.smartdoor.authentication.R
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GoogleSignInHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {

    fun getGoogleSignInClient(): GoogleSignInClient {
        return try {
            // Fallback client ID untuk testing (gunakan web client ID yang umum)
            val clientId = try {
                context.getString(R.string.default_web_client_id)
            } catch (e: Exception) {
                // Fallback jika resource tidak ada
                "904749622966-k9m2mf682a93ej1e991m2nkj5aal8k65.apps.googleusercontent.com"
            }

            if (clientId.isEmpty() || clientId.contains("YOUR_CLIENT_ID")) {
                throw IllegalStateException("Google Client ID not properly configured. Please add valid client ID to strings.xml")
            }

            // Simplified configuration - hanya request email dan profile
            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .build()

            GoogleSignIn.getClient(context, gso)
        } catch (e: Exception) {
            throw IllegalStateException("Failed to initialize Google Sign-In: ${e.message}", e)
        }
    }
    }
