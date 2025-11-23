package com.authentic.smartdoor.storage.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton
import java.util.concurrent.TimeUnit
import com.authentic.smartdoor.storage.remote.api.AuthApiService
import com.authentic.smartdoor.storage.remote.api.DashboardApiService
import com.authentic.smartdoor.storage.remote.api.CameraApiService

@Module
@InstallIn(SingletonComponent::class)
object StorageNetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://pbl311-production.up.railway.app/api/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService = retrofit.create(AuthApiService::class.java)

    @Provides
    @Singleton
    fun provideDashboardApiService(retrofit: Retrofit): DashboardApiService = retrofit.create(DashboardApiService::class.java)

    @Provides
    @Singleton
    fun provideCameraApiService(retrofit: Retrofit): CameraApiService = retrofit.create(CameraApiService::class.java)
}


