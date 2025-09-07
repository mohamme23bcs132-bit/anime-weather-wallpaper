package com.weather.wallpaper

import android.app.WallpaperManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.IOException

class WallpaperModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val reactContext: ReactApplicationContext = reactContext
    
    override fun getName(): String {
        return "WallpaperModule"
    }
    
    @ReactMethod
    fun setWallpaper(base64Image: String, promise: Promise) {
        try {
            val decodedString = Base64.decode(base64Image, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
            } else {
                wallpaperManager.setBitmap(bitmap)
            }
            
            promise.resolve("Wallpaper set successfully")
        } catch (e: IOException) {
            promise.reject("ERROR", "Failed to set wallpaper: ${e.message}")
        } catch (e: Exception) {
            promise.reject("ERROR", "Unexpected error: ${e.message}")
        }
    }
    
    @ReactMethod
    fun setLockScreenWallpaper(base64Image: String, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                val decodedString = Base64.decode(base64Image, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
                val wallpaperManager = WallpaperManager.getInstance(reactContext)
                
                wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)
                promise.resolve("Lock screen wallpaper set successfully")
            } else {
                promise.reject("ERROR", "Lock screen wallpaper setting requires Android N or higher")
            }
        } catch (e: IOException) {
            promise.reject("ERROR", "Failed to set lock screen wallpaper: ${e.message}")
        } catch (e: Exception) {
            promise.reject("ERROR", "Unexpected error: ${e.message}")
        }
    }
    
    @ReactMethod
    fun setBothWallpapers(base64Image: String, promise: Promise) {
        try {
            val decodedString = Base64.decode(base64Image, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK)
            } else {
                wallpaperManager.setBitmap(bitmap)
            }
            
            promise.resolve("Both wallpapers set successfully")
        } catch (e: IOException) {
            promise.reject("ERROR", "Failed to set wallpapers: ${e.message}")
        } catch (e: Exception) {
            promise.reject("ERROR", "Unexpected error: ${e.message}")
        }
    }
}
