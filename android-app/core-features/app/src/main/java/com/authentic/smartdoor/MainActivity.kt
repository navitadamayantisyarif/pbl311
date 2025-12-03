
    package com.authentic.smartdoor

    import android.content.Context
    import android.content.Intent
    import android.os.Bundle
    import androidx.activity.ComponentActivity
    import androidx.activity.compose.setContent
    import androidx.activity.enableEdgeToEdge
    import androidx.activity.result.contract.ActivityResultContracts
    import androidx.compose.foundation.Image
    import androidx.compose.foundation.background
    import androidx.compose.foundation.layout.Arrangement
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Box
    import androidx.compose.foundation.layout.Row
    import androidx.compose.foundation.layout.Spacer
    import androidx.compose.foundation.layout.fillMaxHeight
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.fillMaxWidth
    import androidx.compose.foundation.layout.height
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.layout.size
    import androidx.compose.foundation.layout.offset
    import androidx.compose.foundation.layout.width
    import androidx.compose.foundation.pager.HorizontalPager
    import androidx.compose.foundation.pager.rememberPagerState
    import androidx.compose.foundation.shape.CircleShape
    import androidx.compose.foundation.shape.RoundedCornerShape
    import androidx.compose.material.icons.Icons
    import androidx.compose.material.icons.filled.ArrowBack
    import androidx.compose.material.icons.filled.ArrowForward
    import androidx.compose.material3.ButtonDefaults
    import androidx.compose.material3.ElevatedButton
    import androidx.compose.material3.Icon
    import androidx.compose.material3.IconButton
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Scaffold
    import androidx.compose.material3.Text
    import androidx.compose.runtime.Composable
    import androidx.compose.runtime.LaunchedEffect
    import androidx.compose.runtime.getValue
    import androidx.compose.runtime.mutableStateOf
    import androidx.compose.runtime.remember
    import androidx.compose.runtime.rememberCoroutineScope
    import androidx.compose.runtime.setValue
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.draw.clip
    import androidx.compose.ui.graphics.Color
    import androidx.compose.ui.graphics.ColorFilter
    import androidx.compose.ui.layout.ContentScale
    import androidx.compose.ui.platform.LocalContext
    import androidx.compose.ui.res.painterResource
    import androidx.compose.ui.text.font.FontWeight
    import androidx.compose.ui.text.style.TextAlign
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import androidx.compose.ui.unit.sp
    import com.authentic.smartdoor.ui.theme.PurplePrimary
    import com.authentic.smartdoor.ui.theme.SecureDoorTheme
    import com.authentic.smartdoor.ui.theme.abhayaLibre
    import com.authentic.smartdoor.ui.theme.jura
    import com.authentic.smartdoor.ui.theme.lexend
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.launch

    class MainActivity : ComponentActivity() {

        private val authLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (result.resultCode == RESULT_OK) {
                // Authentication successful, navigate to dashboard
                val intent = Intent(this, com.authentic.smartdoor.dashboard.DashboardActivity::class.java)
                startActivity(intent)
                finish()
            }
        }

        override fun onCreate(savedInstanceState: Bundle?) {
            super.onCreate(savedInstanceState)
            try {
                if (android.os.Build.VERSION.SDK_INT >= 33) {
                    val perm = android.Manifest.permission.POST_NOTIFICATIONS
                    if (androidx.core.content.ContextCompat.checkSelfPermission(this, perm) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        androidx.core.app.ActivityCompat.requestPermissions(this, arrayOf(perm), 1001)
                    }
                }
            } catch (_: Exception) {}
            enableEdgeToEdge()
            setContent {
                SecureDoorTheme {
                    var showSplash by remember { mutableStateOf(true) }
                    var showOnboarding by remember { mutableStateOf(false) }

                    LaunchedEffect(Unit) {
                        delay(1800)
                        showSplash = false
                    }

                    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                        when {
                            showSplash -> {
                                SplashScreen(modifier = Modifier.padding(innerPadding))
                            }
                            showOnboarding -> {
                                OnboardingCarousel(onFinished = { context ->
                                    val intent = Intent(
                                        context,
                                        com.authentic.smartdoor.authentication.AuthenticationActivity::class.java
                                    )
                                    authLauncher.launch(intent)
                                })
                            }
                            else -> {
                                OnboardingScreen(
                                    modifier = Modifier.padding(innerPadding),
                                    onGetStartedClick = {
                                        showOnboarding = true
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    @Composable
    fun SplashScreen(modifier: Modifier = Modifier) {
        Column(
            modifier = modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.securedoor),
                contentDescription = "SecureDoor logo"
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Sederhanakan Akses, Tingkatkan Keamanan",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
        }
    }

    @Composable
    fun OnboardingScreen(
        modifier: Modifier = Modifier,
        onGetStartedClick: () -> Unit = {}
    ) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(Color.White)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(
                    painter = painterResource(id = R.drawable.splash_image_1),
                    contentDescription = "Onboarding illustration",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .offset(y = (-2).dp)
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                        .background(PurplePrimary)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(modifier = Modifier.height(8.dp))

                        // Container untuk semua elemen dengan lebar yang sama
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp)
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "YOUR DOOR, YOUR CONTROL",
                                    style = MaterialTheme.typography.headlineSmall.copy(fontFamily = lexend, fontWeight = FontWeight.Medium, fontSize = 34.sp),
                                    color = Color.White,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Kelola akses pintu, cek aktivitas, dan kontol pintu \nkapan pun hanya lewat pintu anda.",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontFamily = lexend, fontWeight = FontWeight.Medium, fontSize = 14.sp),
                                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f),
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(15.dp))
                                ElevatedButton(
                                    onClick = onGetStartedClick,
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = ButtonDefaults.elevatedButtonColors(
                                        containerColor = Color(0xFFC4BFFF),
                                        contentColor = Color.Black
                                    ),
                                    elevation = ButtonDefaults.elevatedButtonElevation(
                                        defaultElevation = 8.dp,
                                        pressedElevation = 12.dp,
                                        hoveredElevation = 10.dp
                                    )
                                ) {
                                    Text(
                                        text = "Get Started",
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontFamily = abhayaLibre,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 18.sp
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Floating SECUREDOOR logo overlay
            Image(
                painter = painterResource(id = R.drawable.securedoor),
                contentDescription = "SECUREDOOR logo",
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .offset(y = (-80).dp)
                    .size(310.dp)
            )
        }
    }

    data class OnboardingPage(
        val imageRes: Int,
        val title: String,
        val description: String
    )

    @Composable
    fun OnboardingCarousel(onFinished: (Context) -> Unit) {
        val pages = listOf(
            OnboardingPage(
                imageRes = R.drawable.splash_image_2,
                title = "Buka Kunci Cerdas",
                description = "Buka pintu rumah atau kantor dengan aman hanya melalui ponsel Anda. Tanpa kunci fisik, lebih praktis dan modern."
            ),
            OnboardingPage(
                imageRes = R.drawable.splash_image_3,
                title = "Akses Waktu Nyata",
                description = "Kontrol pintu secara langsung kapan saja. Lihat status terkini dan kelola akses dalam hitungan detik."
            ),
            OnboardingPage(
                imageRes = R.drawable.splash_image_4,
                title = "Riwayat & Peringatan",
                description = "Pantau riwayat akses pintu dan terima notifikasi segera untuk setiap aktivitas, sukses maupun percobaan gagal."
            )
        )

        val pagerState = rememberPagerState(pageCount = { pages.size })
        val scope = rememberCoroutineScope()
        val context = LocalContext.current

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
        ) {

            // 🔵 CONTAINER UNGU dengan radius lebih besar
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .fillMaxHeight(0.82f)
                    .clip(RoundedCornerShape(topStart = 48.dp, topEnd = 48.dp)) // radius diperbesar
                    .background(PurplePrimary)
            ) {

                // 🔵 SEGMENTED PAGE INDICATOR (di dalam container ungu)
                Row(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 20.dp), // menempatkan indicator sedikit turun dari radius
                    horizontalArrangement = Arrangement.Center
                ) {
                    repeat(pages.size) { index ->
                        val active = pagerState.currentPage == index
                        Box(
                            modifier = Modifier
                                .padding(horizontal = 4.dp)
                                .clip(CircleShape)
                                .background(if (active) Color.White else Color.White.copy(alpha = 0.4f))
                                .height(6.dp)
                                .width(if (active) 30.dp else 10.dp)
                        )
                    }
                }

                // 🔄 PAGER TETAP
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 60.dp) // agar content tidak menabrak indicator
                ) { pageIndex ->
                    OnboardingCarouselPage(
                        pageData = pages[pageIndex],
                        pageIndex = pageIndex
                    )
                }

                // ⬅➡ BUTTON NAVIGATION
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 24.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = {
                            scope.launch {
                                pagerState.animateScrollToPage((pagerState.currentPage - 1).coerceAtLeast(0))
                            }
                        },
                        modifier = Modifier
                            .size(56.dp)
                            .background(
                                color = Color.White.copy(alpha = 0.2f),
                                shape = CircleShape
                            )
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    IconButton(
                        onClick = {
                            if (pagerState.currentPage < pages.size - 1) {
                                scope.launch {
                                    pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                }
                            } else {
                                onFinished(context)
                            }
                        },
                        modifier = Modifier
                            .size(56.dp)
                            .background(
                                color = Color.White,
                                shape = CircleShape
                            )
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = "Next",
                            tint = PurplePrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }



    @Composable
    fun OnboardingCarouselPage(pageData: OnboardingPage, pageIndex: Int) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Image(
                painter = painterResource(id = pageData.imageRes),
                contentDescription = pageData.title,
                modifier = Modifier.size(150.dp),
                colorFilter = if (pageIndex < 2) ColorFilter.tint(Color.White) else null
            )
            Spacer(modifier = Modifier.height(40.dp))
            Text(
                text = pageData.title,
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontFamily = jura,
                    fontWeight = FontWeight.Bold,
                    fontSize = 32.sp
                ),
                color = Color.White,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = pageData.description,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontFamily = jura,
                    fontWeight = FontWeight.Normal,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                ),
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 20.dp)
            )
        }
    }

    @Preview(showBackground = true, name = "Splash")
    @Composable
    fun SplashPreview() {
        SecureDoorTheme {
            SplashScreen()
        }
    }

    @Preview(showBackground = true, name = "Onboarding")
    @Composable
    fun OnboardingPreview() {
        SecureDoorTheme {
            OnboardingScreen()
        }
    }

    @Preview(showBackground = true, name = "Onboarding Carousel")
    @Composable
    fun OnboardingCarouselPreview() {
        SecureDoorTheme {
            OnboardingCarousel(onFinished = {})
        }
    }
