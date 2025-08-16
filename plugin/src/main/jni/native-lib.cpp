#include <jni.h>

extern "C"
JNIEXPORT jstring JNICALL
Java_dev_mmrl_Module_getNativeString(JNIEnv* env, jobject /* this */) {
    const char* message = "Hello from JNI!";
    return env->NewStringUTF(message);
}