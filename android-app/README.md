# GIOSTACCHIO Android

Questa cartella contiene il progetto Android nativo di GIOSTACCHIO.

## Come funziona

La build copia automaticamente dalla root del repository i file della PWA (accordatore, metronomo, CSS, JavaScript e risorse) dentro l'APK/AAB. In questo modo sito e app Android usano la stessa base funzionale e non devono essere mantenuti separatamente.

L'app apre i file locali tramite `https://appassets.androidplatform.net`, usando `WebViewAssetLoader`, così le API audio lavorano in un contesto HTTPS sicuro. Il permesso Android `RECORD_AUDIO` viene richiesto soltanto quando l'accordatore prova ad accedere al microfono.

## Versioni build

- Application ID: `it.giostacchio.app`
- minSdk: 26
- targetSdk: 36
- compileSdk: 36
- Android Gradle Plugin: 9.4.0
- Gradle: 9.6.0
- JDK: 17

## APK senza Android Studio

Il workflow GitHub Actions `Build GIOSTACCHIO Android` compila automaticamente una APK debug e un AAB release non firmato. L'APK debug serve per i test sul telefono. Per Play Store verrà aggiunta in seguito la firma release tramite secrets GitHub, senza inserire chiavi private nel repository.
