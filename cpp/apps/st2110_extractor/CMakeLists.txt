cmake_minimum_required(VERSION 3.9)

list_add_executable(st2110_extractor)

target_link_libraries(${PROJECT_NAME}
        apps_common
        ebu_list_analysis
        ebu_list_ptp
        ebu_list_definitions
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
