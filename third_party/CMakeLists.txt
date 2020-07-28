cmake_minimum_required (VERSION 3.9)

set (THIRD_PARTY_MODULE_PATH "${PROJECT_SOURCE_DIR}/third_party")

# -------------------------------------------------------------------------
add_subdirectory(bicla)
# -------------------------------------------------------------------------
add_subdirectory(bimo/cpp/lib)
add_subdirectory(bimo/third-party/SimpleAmqpClient)
# -------------------------------------------------------------------------
add_subdirectory(influxdb-cpp-rest)
# -------------------------------------------------------------------------
add_subdirectory(GSL)
# -------------------------------------------------------------------------
add_subdirectory(libklvanc)
# -------------------------------------------------------------------------
set_target_properties(bimo PROPERTIES FOLDER "third-party")
set_target_properties(influxdb-cpp-rest PROPERTIES FOLDER "third-party")
