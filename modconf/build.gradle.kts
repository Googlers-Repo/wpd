plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.protobuf)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
}

android {
    namespace = "dev.mmrl.wpd"
    compileSdk = 36

    defaultConfig {
        minSdk = 21
        multiDexEnabled = false

        ndk {
            abiFilters += arrayOf("arm64-v8a", "armeabi-v7a", "x86", "x86_64")
        }

        externalNativeBuild {
            cmake {
                arguments += listOf(
                    "-DANDROID_STL=c++_static",
                    "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"
                )
            }
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/jni/CMakeLists.txt")
            version = "3.22.1"
        }
    }

    buildTypes {
        release {
            isShrinkResources = false
            multiDexEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.13"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    packaging.resources.excludes += setOf(
        "META-INF/**",
        "okhttp3/**",
        "kotlin/**",
        "org/**",
        "**.properties",
        "**.bin",
        "**/*.proto"
    )
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.05.00")
    compileOnly(composeBom)

    compileOnly("androidx.activity:activity-compose:1.9.0")
    compileOnly("androidx.compose.ui:ui:1.6.7")
    compileOnly("androidx.compose.material3:material3:1.2.1")

    compileOnly(libs.androidx.navigation.compose)
    compileOnly(libs.androidx.navigation.runtime.ktx)

    compileOnly(libs.mmrl.modconf)
    compileOnly(libs.mmrl.platform)
    compileOnly(libs.mmrl.ui)
    compileOnly(libs.mmrl.ext)

    compileOnly(libs.square.retrofit.moshi)
    compileOnly(libs.square.retrofit.kotlinxSerialization)
    compileOnly(libs.square.moshi)
    ksp(libs.square.moshi.kotlin)
}

interface InjectedExecOps {
    @get:Inject
    val execOps: ExecOperations
}

val Task.injected get() = project.objects.newInstance<InjectedExecOps>()
fun Task.exec(action: Action<in ExecSpec>): ExecResult = injected.execOps.exec(action)

val androidHome: String? = System.getenv("ANDROID_HOME")
    ?: System.getenv("ANDROID_SDK_ROOT")

val isWindows = System.getProperty("os.name").lowercase().contains("win")
val isCI = System.getenv("CI") == "true"

val d8Bin = androidHome?.let {
    File(
        it,
        "build-tools/${
            android.compileSdkVersion?.replace(
                "android-",
                ""
            )
        }.0.0/d8" + if (isWindows) ".bat" else ""
    ).absolutePath
}

val adbBin = androidHome?.let {
    File(it, "platform-tools/adb" + if (isWindows) ".exe" else "").absolutePath
}

val buildDir: File = project.layout.buildDirectory.get().asFile

val classesJar =
    buildDir.resolve("intermediates/aar_main_jar/release/syncReleaseLibJars/classes.jar")
val classesOutput = buildDir.resolve("classes.dex")
val dexOutput = rootDir.resolve("module/webroot/assets/main.dex")

fun Task.d8(vararg args: String) {
    if (d8Bin == null) {
        error("ANDROID_HOME or ANDROID_SDK_ROOT not set. Cannot locate d8.")
    }

    exec {
        commandLine(d8Bin, *args)
    }
}

fun Task.adb(vararg args: String) {
    if (isCI) {
        print("ADB can't run in CI environment.")
        return
    }

    if (adbBin == null) {
        error("ANDROID_HOME or ANDROID_SDK_ROOT not set. Cannot locate adb.")
    }

    exec {
        commandLine(adbBin, *args)
    }
}

fun findLatestNativeLib(libName: String, abi: String = "arm64-v8a"): File? {
    return buildDir.resolve("intermediates/cxx/Debug").walkTopDown()
        .filter {
            it.isFile &&
                    it.name == libName &&
                    (abi in it.path)
        }
        .maxByOrNull { it.lastModified() }
}

fun Task.copyAndPushNativeLibs(vararg files: File?) {
    for (file in files) {
        if (file != null) {
            val copyTo = buildDir.resolve(file.name)
            copyTo.parentFile.mkdirs()
            file.copyTo(copyTo, overwrite = true)
            println("Copied ${file.path} to: $copyTo")

            if (!isCI) {
                adb(
                    "push",
                    file.absolutePath,
                    "/data/adb/modules/mmrl_wpd/modconf/shared/${file.name}"
                )
            }
        } else {
            println("No .so file found in intermediates.")
        }
    }
}

tasks.register("build-dex") {
    doFirst {
        classesOutput.delete()
        dexOutput.delete()
    }

    dependsOn("build")

    doLast {
        if (d8Bin == null) {
            println("Skipping build-dex: ANDROID_HOME or ANDROID_SDK_ROOT not set.")
            return@doLast
        }

        val d8File = File(d8Bin)
        if (!d8File.exists()) {
            println("Skipping build-dex: d8 not found at $d8Bin")
            return@doLast
        }

        if (!d8File.canExecute()) {
            d8File.setExecutable(true)
        }

        d8("--output", buildDir.absolutePath, classesJar.absolutePath)

        if (classesOutput.copyRecursively(dexOutput, overwrite = true)) {
            println("DEX file created at: $dexOutput")

            if (!isCI) {
                println("Pushing DEX file to device...")
                adb(
                    "push",
                    dexOutput.absolutePath,
                    "/data/adb/modules/mmrl_wpd/modconf/assets/${dexOutput.name}"
                )
            }
        }

//        copyAndPushNativeLibs(
//            findLatestNativeLib("libnative.so"),
//        )
    }
}
