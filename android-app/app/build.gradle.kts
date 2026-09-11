plugins {
    id("com.android.application")
}

android {
    namespace = "it.giostacchio.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "it.giostacchio.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))
}

val syncWebAssets by tasks.registering(Copy::class) {
    from(rootProject.projectDir.parentFile) {
        include(
            "index.html",
            "styles.css",
            "metronome.css",
            "app.js",
            "metronome.js",
            "config.js",
            "privacy.html",
            "manifest.webmanifest",
            "service-worker.js",
            "icon-192.png",
            "icon-512.png",
            "icon-maskable-192.png",
            "icon-maskable-512.png",
            "apple-touch-icon.png",
            "favicon.ico"
        )
    }
    into(layout.buildDirectory.dir("generated/webAssets/web"))
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.17.0")
}
