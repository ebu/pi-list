cmake_minimum_required(VERSION 3.9)

list_add_executable(pcap_2110_20_timestamp_dumper)

target_link_libraries(${PROJECT_NAME}
        ebu_list_core
        ebu_list_pcap
        ebu_list_rtp
        ebu_list_st2110
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
