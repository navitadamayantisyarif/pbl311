plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.authentic.smartdoor"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.authentic.smartdoor"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("releaseKey") {
            storeFile = file("D:/Project/PBL-211/authentic-smart-door-lock/android-app/core-features/app/release-key")
            storePassword = "hafiz24"
            keyAlias = "release-key"
            keyPassword = "hafiz24"
        }
        create("debugKey") {
            storeFile = file("D:/Project/PBL-211/authentic-smart-door-lock/android-app/core-features/app/release-key")
            storePassword = "hafiz24"
            keyAlias = "release-key"
            keyPassword = "hafiz24"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("releaseKey")
        }
        debug {
            signingConfig = signingConfigs.getByName("debugKey")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {

    implementation(project(":authentication"))
    implementation(project(":dashboard"))
    implementation(project(":storage"))

    // Hilt
    implementation("com.google.dagger:hilt-android:2.56.2")
    ksp("com.google.dagger:hilt-android-compiler:2.56.2")

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation("androidx.compose.ui:ui-text-google-fonts:1.9.0")
    implementation("androidx.compose.foundation:foundation:1.7.0-beta02")


    // Firebase Messaging
    implementation(platform("com.google.firebase:firebase-bom:33.4.0"))
    implementation("com.google.firebase:firebase-messaging")

    // Coroutines
    implementation(libs.kotlinx.coroutines)
    implementation("com.google.firebase:firebase-analytics")

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
