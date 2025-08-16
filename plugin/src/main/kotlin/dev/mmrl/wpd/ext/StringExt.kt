package dev.mmrl.wpd.ext

fun String.limitOrExtend(limit: Int = 10, padChar: Char = ' '): String {
    return if (this.length > limit) {
        this.substring(0, limit)
    } else {
        this.padEnd(limit, padChar)
    }
}