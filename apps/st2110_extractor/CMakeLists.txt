cmake_minimum_required (VERSION 3.9)

list_add_executable(st2110_extractor)

target_link_libraries (${PROJECT_NAME}
		apps_common
		ebu_list_pcap
		ebu_list_ptp
		bicla
		CONAN_PKG::libpng
		${${PROJECT_NAME}_LINK_FLAGS}
)
