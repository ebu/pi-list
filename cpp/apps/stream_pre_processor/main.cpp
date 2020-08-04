#include "bisect/bicla.h"
#include "bisect/bimo/mq/receiver.h"
#include "bisect/bimo/mq/sender.h"
#include "ebu/list/definitions/exchanges.h"
#include "ebu/list/definitions/queues.h"
#include "ebu/list/preprocessor/stream_analyzer.h"
#include "ebu/list/version.h"
#include "timer.h"
#include <boost/asio/io_service.hpp>

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::ptp;
using nlohmann::json;

namespace
{
    json compose_response(const std::string& workflow_id, const std::string& status, unsigned int progress,
                          const std::string& error, const json& analysis_result)
    {
        json response;
        response["workflow_id"] = workflow_id;
        response["status"]      = status;
        response["progress"]    = progress;

        if(!error.empty())
        {
            response["error"] = error;
        }
        else if(!analysis_result.empty())
        {
            response["data"] = analysis_result;
        }

        return response;
    }

    bool is_action_valid(const json& msg, const json::const_iterator& action)
    {
        return action != msg.end() && action->is_string() && action->get<std::string>() == "preprocessing.request";
    }

    bool is_workflow_id_valid(const json& msg, const json::const_iterator& workflow_id)
    {
        return workflow_id != msg.end() && workflow_id->is_string();
    }

    bool is_pcap_id_valid(const json& msg, const json::const_iterator& pcap_id)
    {
        return pcap_id != msg.end() && pcap_id->is_string();
    }

    bool is_pcap_path_valid(const json& msg, const json::const_iterator& pcap_path)
    {
        return pcap_path != msg.end() && pcap_path->is_string();
    }

    struct config
    {
        std::string id    = "5126c43c-076c-4fc1-befa-7e273a4c8cd9";
        std::string label = "EBU LIST Stream Pre-Processor";
        std::optional<std::string> cli_broker_url;

        std::string broker_url = "amqp://localhost:5672";
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        auto [parse_result, config] = parse(argc, argv,
                                            argument(&config::cli_broker_url, "broker URL",
                                                     "the RabbitMQ broker URL (default is amqp://localhost:5672)"));

        if(config.cli_broker_url)
        {
            config.broker_url = *config.cli_broker_url;
        }

        if(parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

} // namespace

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    auto console = logger();

    const auto configuration = parse_or_usage_and_exit(argc, argv);

    console->info("{}, based on EBU LIST v{}", configuration.label, ebu_list::version());
    console->info("id: {}", configuration.id);
    console->info("RabbitMQ url: {}", configuration.broker_url);

    try
    {
        boost::asio::io_service io;

        bisect::bimo::mq::exchange_sender exchange(configuration.broker_url,
                                                   ebu_list::definitions::exchanges::preprocessor_status::info);

        auto timer = ebu_list::preprocessor::interval_timer(io, std::chrono::seconds(1), []() {});

        auto on_message = [&exchange, &timer, &console](const std::string& /*routing_key*/, const json& message,
                                                        const bisect::bimo::mq::ack_callback& ack) {
            const auto action      = message.find("action");
            const auto workflow_id = message.find("workflow_id");
            const auto pcap_id     = message.find("pcap_id");
            const auto pcap_path   = message.find("pcap_path");
            json response{};

            if(!is_action_valid(message, action))
            {
                response = compose_response("", "failed", 0, "Invalid \"action\" field.", "");
            }
            else if(!is_workflow_id_valid(message, workflow_id))
            {
                response = compose_response("", "failed", 0, "Invalid \"workflow_id\" field.", "");
            }
            else if(!is_pcap_id_valid(message, pcap_id))
            {
                response =
                    compose_response(workflow_id->get<std::string>(), "failed", 0, "Invalid \"pcap_id\" field.", "");
            }
            else if(!is_pcap_path_valid(message, pcap_id))
            {
                response =
                    compose_response(workflow_id->get<std::string>(), "failed", 0, "Invalid \"pcap_path\" field.", "");
            }
            else
            {
                console->info("Processing {}.", pcap_id->get<std::string>());
                try
                {
                    const json analysis_result =
                        analyze_stream(pcap_path->get<std::string>(), pcap_id->get<std::string>());
                    response = compose_response(workflow_id->get<std::string>(), "completed", 100, "", analysis_result);
                    console->info("Processing {} succeeded.", pcap_id->get<std::string>());
                }
                catch(std::exception& ex)
                {
                    response = compose_response(workflow_id->get<std::string>(), "failed", 100, ex.what(), "");
                    console->info("Processing {} failed.", pcap_id->get<std::string>());
                }

                ack();
            }

            exchange.send(ebu_list::definitions::exchanges::preprocessor_status::keys::announce, response.dump());
            timer.fire_async();
        };

        const bisect::bimo::mq::receiver inbound_work_queue(
            configuration.broker_url, ebu_list::definitions::queues::preprocessor::start_request, on_message);
        io.run();
    }
    catch(std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    console->info("Exiting.");
    return 0;
}
