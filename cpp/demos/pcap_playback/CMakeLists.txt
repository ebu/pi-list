cmake_minimum_required (VERSION 3.9)

list_add_executable(pcap_playback)

target_link_libraries (${PROJECT_NAME}
    ebu_list_st2110
    ebu_list_pcap
    bicla
    ${${PROJECT_NAME}_LINK_FLAGS}
)
