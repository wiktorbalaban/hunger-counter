package PACKAGE_NAME

import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DynamicIconModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "DynamicIcon"

    @ReactMethod
    fun changeIcon(nextIcon: String, currentIcon: String, promise: Promise) {
        val pm = reactContext.packageManager
        val pkg = reactContext.packageName
        try {
            // Enable the new alias first, then immediately disable the old one.
            // Both calls use DONT_KILL_APP so there is no app restart and no
            // gap where both aliases are visible in the launcher.
            pm.setComponentEnabledSetting(
                ComponentName(pkg, "$pkg.MainActivity$nextIcon"),
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            )
            pm.setComponentEnabledSetting(
                ComponentName(pkg, "$pkg.MainActivity$currentIcon"),
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
            promise.resolve(nextIcon)
        } catch (e: Exception) {
            promise.reject("ICON_CHANGE_FAILED", e.message ?: "Unknown error", e)
        }
    }
}
