cmake_minimum_required(VERSION 3.9)

list_add_executable(stream_pre_processor)

target_link_libraries(${PROJECT_NAME}
        apps_common
        ebu_list_preprocessor
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
