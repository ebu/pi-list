cmake_minimum_required(VERSION 3.9)

list_add_executable(rtp_analyzer)

target_link_libraries(${PROJECT_NAME}
        ebu_list_core
        ebu_list_st2110
        ebu_list_pcap
        bicla
        CONAN_PKG::nlohmann_json
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
