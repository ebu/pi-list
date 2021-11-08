#include "ebu/list/st2022_7/analysis.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/st2022_7/caching_pcap_reader.h"
#include "ebu/list/st2022_7/db_handler_factory.h"
#include "ebu/list/st2022_7/filtered_pcap_reader.h"
#include "ebu/list/st2022_7/sequence_number.h"
#include "ebu/list/version.h"
using namespace ebu_list;
using json = nlohmann::json;
//------------------------------------------------------------------------------

namespace
{
    std::string get(const json& config, const std::string_view name)
    {
        const auto it = config.find(name);
        LIST_ENFORCE(it != config.end(), std::runtime_error, "No '{}' in request", name);
        return it->get<std::string>();
    }

    // Return true if uses extended sequence number (ST2110-20)
    bool check_media_type_is_extended(const nlohmann::json& a, const nlohmann::json& b)
    {
        const auto type_a = get(a, "media_type");
        const auto type_b = get(b, "media_type");

        LIST_ENFORCE(type_a == type_b, std::runtime_error, "Different media types: {} / {}", type_a, type_b);
        return type_a == "video";
    }

    // source_address, destination_address, destination_port
    std::tuple<ipv4::address, ipv4::endpoint> get_network_information(const json& config)
    {
        const auto net_it = config.find("network_information");
        LIST_ENFORCE(net_it != config.end(), std::runtime_error, "No 'network_information' in request");
        const auto destination =
            ipv4::from_string(get(*net_it, "destination_address"), get(*net_it, "destination_port"));

        return {ipv4::from_dotted_string(get(*net_it, "source_address")), destination};
    }

    auto load(const nlohmann::json& leg)
    {
        const auto pcap_file = get(leg, "pcap_file");
        auto reader          = std::make_unique<pcap_reader>(pcap_file);

        const auto [source_address, destination] = get_network_information(leg);

        auto filtered = std::make_unique<filtered_pcap_reader>(std::move(reader), source_address, destination);
        return caching_pcap_reader(std::move(filtered));
    }

    std::optional<uint32_t> get_sequence_number(const caching_pcap_reader& reader, bool is_extended)
    {
        if(!reader.current()) return std::nullopt;

        const auto sn = reader.current().value().info.rtp.view().sequence_number();

        if(!is_extended)
        {
            return sn;
        }

        const auto& data = reader.current().value().sdu.view();

        net_uint16_t high_sn        = {};
        constexpr auto minimum_size = ssizeof<net_uint16_t>();
        if(data.size() < minimum_size)
        {
            logger()->error("Packet size smaller than minimum");
            return std::nullopt;
        }

        memcpy(&high_sn, data.data(), sizeof(high_sn));
        const uint32_t high    = to_native(high_sn);
        const auto extended_sn = high << 16 | sn;
        return extended_sn;
    }

    // Returns {number of skipped packets; true if found, false if EOF }
    std::tuple<uint64_t, bool> skip_until_sequence_number(caching_pcap_reader& reader, uint32_t wanted_sn,
                                                          bool is_extended)
    {
        for(uint64_t counter = 0;; ++counter)
        {
            const auto current = get_sequence_number(reader, is_extended);
            if(!current) return {counter, false};
            if(current.value() == wanted_sn) return {counter, true};
            reader.next();
        }
    }

    [[nodiscard]] uint64_t deplete(caching_pcap_reader& reader)
    {
        uint64_t count = 0;
        for(; reader.current(); ++count)
        {
            reader.next();
        }

        return count;
    }

    enum class result_kind
    {
        success,
        no_packets,
        no_coincident_packets
    };

    struct align_result
    {
        result_kind kind;
        uint64_t skipped_a = 0;
        uint64_t skipped_b = 0;
    };

    [[nodiscard]] align_result align_readers(caching_pcap_reader& reader_a, caching_pcap_reader& reader_b,
                                             bool is_extended)
    {
        const auto a_sn = get_sequence_number(reader_a, is_extended);
        const auto b_sn = get_sequence_number(reader_b, is_extended);

        if(!a_sn || !b_sn) return align_result{result_kind::no_packets};

        const auto comparison = sequence_number::compare(*a_sn, *b_sn);

        if(comparison == sequence_number::compare_result::a_after_b)
        {
            const auto [skipped, found] = skip_until_sequence_number(reader_b, a_sn.value(), is_extended);
            if(!found) return align_result{result_kind::no_coincident_packets, 0, skipped};
            return align_result{result_kind::success, 0, skipped};
        }
        else if(comparison == sequence_number::compare_result::a_before_b)
        {
            const auto [skipped, found] = skip_until_sequence_number(reader_a, b_sn.value(), is_extended);
            if(!found) return align_result{result_kind::no_coincident_packets, skipped, 0};
            return align_result{result_kind::success, skipped, 0};
        }

        assert(comparison == sequence_number::compare_result::equal);
        return align_result{result_kind::success};
    }

    struct result
    {
        bool completed = true;  // is the result definitive?
        bool success   = false; // did the analysis run correctly?
        std::string message;

        uint64_t intersection_size_in_packets   = 0;
        uint64_t packets_in_a                   = 0;
        uint64_t packets_in_b                   = 0;
        uint64_t equal_packets                  = 0;
        uint64_t missing_packets                = 0;
        uint64_t different_packets              = 0;
        double mean_squared_delta               = 0.0;
        double max_squared_delta                = 0.0;
        std::optional<double> min_squared_delta = 0.0;
    };

    result make_error_result(std::string_view message, bool completed)
    {
        result r{};
        r.message   = message;
        r.completed = completed;
        return r;
    }

    // Returns true if the packets are different. False if they are equal.
    bool deep_compare_packets(const rtp::packet& a, const rtp::packet& b)
    {
        if(a.info.rtp.data().view() != b.info.rtp.data().view()) return true;
        return (a.sdu.view() != b.sdu.view());
    }

    void update_time_info(result& r, const rtp::packet& a, const rtp::packet& b)
    {
        const auto a_time =
            std::chrono::duration_cast<std::chrono::nanoseconds>(a.info.udp.packet_time.time_since_epoch()).count();
        const auto b_time =
            std::chrono::duration_cast<std::chrono::nanoseconds>(b.info.udp.packet_time.time_since_epoch()).count();
        const auto delta_ns = a_time - b_time;
        const auto squared  = static_cast<double>(delta_ns * delta_ns);

        r.mean_squared_delta = (r.mean_squared_delta * r.equal_packets + squared) / (r.equal_packets + 1);
        r.max_squared_delta  = std::max(r.max_squared_delta, squared);

        if(r.min_squared_delta)
        {
            r.min_squared_delta = std::min(r.min_squared_delta.value(), squared);
        }
        else
        {
            r.min_squared_delta = squared;
        }
    }

    result do_analyse(const nlohmann::json& a, const nlohmann::json& b)
    {
        const auto is_extended = check_media_type_is_extended(a, b);

        auto a_reader = load(a);
        auto b_reader = load(b);

        const auto align_r = align_readers(a_reader, b_reader, is_extended);
        if(align_r.kind == result_kind::no_packets) return make_error_result("No packets", true);
        if(align_r.kind == result_kind::no_coincident_packets) return make_error_result("No coincident packets", false);

        result r;
        r.completed    = true;
        r.packets_in_a = align_r.skipped_a;
        r.packets_in_b = align_r.skipped_b;

        for(;;)
        {
            auto maybe_packet_a = a_reader.current();
            auto maybe_packet_b = b_reader.current();

            if(!maybe_packet_a)
            {
                const auto remaining = deplete(b_reader);
                r.success            = true;
                r.packets_in_b += remaining;
                return r;
            }

            if(!maybe_packet_b)
            {
                const auto remaining = deplete(a_reader);
                r.success            = true;
                r.packets_in_a += remaining;
                return r;
            }

            const auto sn_a = a_reader.current().value().info.rtp.view().sequence_number();
            const auto sn_b = b_reader.current().value().info.rtp.view().sequence_number();

            //            if(sn_a != sn_b)
            //            {
            //                logger()->info("Mismatch in sequence number: {} / {}", sn_a, sn_b);
            //            }

            const auto compare_result = sequence_number::compare(sn_a, sn_b, is_extended);

            if(compare_result == sequence_number::compare_result::equal)
            {
                update_time_info(r, a_reader.current().value(), b_reader.current().value());

                const auto packets_are_different =
                    deep_compare_packets(a_reader.current().value(), b_reader.current().value());

                if(packets_are_different)
                {
                    ++r.different_packets;
                }

                ++r.equal_packets;
                ++r.packets_in_a;
                ++r.packets_in_b;
                ++r.intersection_size_in_packets;

                a_reader.next();
                b_reader.next();

                continue;
            }

            if(compare_result == sequence_number::compare_result::a_after_b)
            {
                const auto [skipped, found] = skip_until_sequence_number(b_reader, sn_a, is_extended);
                (void)found; // It will exit on the top

                r.packets_in_b += skipped;
                r.intersection_size_in_packets += skipped;
                r.missing_packets += skipped;

                continue;
            }

            assert(compare_result == sequence_number::compare_result::a_before_b);
            const auto [skipped, found] = skip_until_sequence_number(a_reader, sn_b, is_extended);
            (void)found; // It will exit on the top

            r.packets_in_a += skipped;
            r.intersection_size_in_packets += skipped;
            r.missing_packets += skipped;
        }
    }

    json build_response(const result& r)
    {
        json response;
        response["succeeded"] = r.success;
        response["message"]   = r.message;
        response["analysis"] =
            std::map<std::string, json>{{"totalNumberOfPackets", r.packets_in_a + r.packets_in_b},
                                        {"intersectionSizeInPackets", r.intersection_size_in_packets * 2},
                                        {"numberOfMissingPackets", r.missing_packets * 2},
                                        {"numberOfDifferentPackets", r.different_packets * 2},
                                        {"averageDeltaNs", sqrt(r.mean_squared_delta)},
                                        {"minDeltaNs", sqrt(r.min_squared_delta.value_or(0))},
                                        {"maxDeltaNs", sqrt(r.max_squared_delta)}};

        return response;
    }
} // namespace

//------------------------------------------------------------------------------

nlohmann::json st2022_7::analyse(const nlohmann::json& configuration) noexcept
{
    try
    {
        const auto reference_it = configuration.find("reference");
        LIST_ENFORCE(reference_it != configuration.end(), std::runtime_error, "No 'reference' in request");

        const auto main_it = configuration.find("main");
        LIST_ENFORCE(main_it != configuration.end(), std::runtime_error, "No 'main' in request");

        const auto result_a_b = do_analyse(*reference_it, *main_it);

        if(result_a_b.completed)
        {
            return build_response(result_a_b);
        }

        const auto result_b_a = do_analyse(*main_it, *reference_it);
        return build_response(result_a_b);
    }
    catch(std::runtime_error& ex)
    {
        result r;
        r.success = false;
        r.message = ex.what();
        return build_response(r);
    }
    catch(...)
    {
        result r;
        r.success = false;
        r.message = "Unknown exception";
        return build_response(r);
    }
}
