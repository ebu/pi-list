cmake_minimum_required(VERSION 3.9)

list_add_executable(pcap_dumper)

target_link_libraries(${PROJECT_NAME}
        ebu_list_core
        ebu_list_pcap
        ebu_list_ptp
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
