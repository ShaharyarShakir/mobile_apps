package com.example.imagegallery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.fillMaxSize
import com.example.imagegallery.core.designsystem.ImageGalleryTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            ImageGalleryTheme {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Gallery feature will go here.
                }
            }
        }
    }
}
