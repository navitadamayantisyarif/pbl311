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
            val clientId = context.getString(R.string.default_web_client_id)
            android.util.Log.d("GoogleSignInHelper", "Using Web Client ID: $clientId")

            require(clientId.isNotEmpty() && !clientId.contains("YOUR_CLIENT_ID")) {
                "Google Client ID not properly configured. Please add valid client ID to strings.xml"
            }

            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .requestIdToken(clientId)
                .build()

            android.util.Log.d("GoogleSignInHelper", "GoogleSignInOptions with requestIdToken")
            GoogleSignIn.getClient(context, gso)
        } catch (e: Exception) {
            android.util.Log.e("GoogleSignInHelper", "Failed to initialize Google Sign-In: ${e.message}", e)
            throw IllegalStateException("Failed to initialize Google Sign-In: ${e.message}", e)
        }
    }
    }
