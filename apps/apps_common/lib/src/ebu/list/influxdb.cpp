#include "pch.h"
#include "ebu/list/influxdb.h"

using namespace influxdb::api;
using namespace ebu_list;
using namespace ebu_list::influx;
using namespace std;

//------------------------------------------------------------------------------

namespace
{
    constexpr auto max_cached_lines = 4096; // Docs say maximum is 5k
    constexpr auto influx_db_name = "LIST";
}

//------------------------------------------------------------------------------

caching_influx_writer::caching_influx_writer(std::string_view url)
    : api_(std::string(url), influx_db_name)
{
    api_.create();
}

void caching_influx_writer::write(influxdb::api::line&& line)
{
    lines_ << line.get() << "\n";
    ++count_;
    check_cache();
}

void caching_influx_writer::on_complete()
{
    send_cache();
}

void caching_influx_writer::check_cache()
{
    if (count_ == max_cached_lines)
    {
        send_cache();
    }
}

void caching_influx_writer::send_cache()
{
    api_.insert(influxdb::api::line(lines_.str()));
    lines_.clear();
    count_ = 0;
}

//------------------------------------------------------------------------------

base_influx_logger::base_influx_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id)
    : writer_(std::string(url)),
    pcap_id_(pcap_id),
    stream_id_(stream_id)
{
}

void base_influx_logger::on_complete()
{
    writer_.on_complete();
}
