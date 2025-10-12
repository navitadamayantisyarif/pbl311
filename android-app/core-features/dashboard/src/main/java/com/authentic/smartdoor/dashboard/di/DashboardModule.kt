package com.authentic.smartdoor.dashboard.di

import com.authentic.smartdoor.dashboard.data.remote.DashboardApiService
import com.authentic.smartdoor.dashboard.data.repository.DashboardRepositoryImpl
import com.authentic.smartdoor.dashboard.domain.repository.DashboardRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class DashboardModule {

    @Binds
    @Singleton
    abstract fun bindDashboardRepository(
        dashboardRepositoryImpl: DashboardRepositoryImpl
    ): DashboardRepository

    companion object {
        @Provides
        @Singleton
        fun provideDashboardApiService(retrofit: Retrofit): DashboardApiService {
            return retrofit.create(DashboardApiService::class.java)
        }
    }
}
