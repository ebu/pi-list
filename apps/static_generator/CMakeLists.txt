cmake_minimum_required(VERSION 3.9)

list_add_executable(static_generator)

target_link_libraries(${PROJECT_NAME}
        apps_common
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )