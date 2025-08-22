cmake_minimum_required(VERSION 3.22.1)

project(WXU)

set(CMAKE_C_FLAGS_RELEASE "-O3 -Wall -Werror")
set(CMAKE_CXX_FLAGS_RELEASE ${CMAKE_C_FLAGS_RELEASE})
set(CMAKE_C_FLAGS_RELWITHDEBINFO ${CMAKE_C_FLAGS_RELEASE})
set(CMAKE_CXX_FLAGS_RELWITHDEBINFO ${CMAKE_C_FLAGS_RELWITHDEBINFO})

add_link_options("-Wl,--build-id=none,-z,max-page-size=16384")

include_directories(include)

find_library(log-lib log)

add_library(native SHARED
        native-lib.cpp
)
target_link_libraries(native ${log-lib})
