#-------------------------------------------------------------------------------
# The version number and commit hash
set (EBU_LIST_VERSION_MAJOR 1)
set (EBU_LIST_VERSION_MINOR 9)
set (EBU_LIST_VERSION_PATCH 0)
set (EBU_LIST_VERSION "${EBU_LIST_VERSION_MAJOR}.${EBU_LIST_VERSION_MINOR}.${EBU_LIST_VERSION_PATCH}")

find_package(Git)
execute_process(
        COMMAND git log -1 --format=%h
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/
        OUTPUT_VARIABLE EBU_LIST_COMMIT_HASH
        OUTPUT_STRIP_TRAILING_WHITESPACE
)

message(STATUS "Version: ${EBU_LIST_VERSION} @ ${EBU_LIST_COMMIT_HASH}")
