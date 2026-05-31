# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Navigation (prevents stripping of navigation internals)
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# OkHttp / Axios
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# NetInfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# Image Picker
-keep class com.imagepicker.** { *; }

# Keep R8 from stripping Kotlin metadata
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Keep enums
-keepclassmembers enum * { *; }
