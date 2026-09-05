pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
// Version catalog is auto-detected from gradle/libs.versions.toml

rootProject.name = "image_gallery"

include(":app")

include(":core:common")
include(":core:designsystem")
include(":core:ui")

include(":feature:gallery")
