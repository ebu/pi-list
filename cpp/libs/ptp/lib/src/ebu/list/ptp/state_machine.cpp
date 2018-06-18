#include <utility>
#include "ebu/list/ptp/state_machine.h"
using namespace ebu_list;
using namespace ebu_list::ptp;

//------------------------------------------------------------------------------

class state_initial;
class state_waiting_for_sync;
class state_waiting_for_follow_up;
class state_waiting_for_delay_request;
class state_waiting_for_delay_response;

struct context
{
    const state_waiting_for_sync* const waiting_for_sync;
    const state_waiting_for_follow_up* const waiting_for_follow_up;
    const state_waiting_for_delay_request* const waiting_for_delay_request;
    const state_waiting_for_delay_response* const waiting_for_delay_response;

    const state_machine::listener_ptr listener;
    ptp::origin origin {};

    uint16_t current_sequence_id {};
    clock::time_point last_sync_timestamp {};
    ptp::ts80 precise_origin_timestamp {};
    clock::time_point delay_request_timestamp {};
    clock::time_point delay_request_packet_timestamp {};
    ptp::ts80 delay_response_origin_timestamp {};
};

//------------------------------------------------------------------------------

class state
{
public:
    virtual std::string_view get_name() const = 0;
    virtual ~state() = default;

    virtual const state* handle_message(context& c, const ptp::v2::sync& message) const = 0;
    virtual const state* handle_message(context& c, const ptp::v2::follow_up&) const = 0;
    virtual const state* handle_message(context& c, const ptp::v2::delay_req&) const = 0;
    virtual const state* handle_message(context& c, const ptp::v2::delay_resp&) const = 0;
    virtual const state* handle_message(context& c, const ptp::v2::other&) const = 0;
};

//------------------------------------------------------------------------------

class state_initial : public state
{
public:
    std::string_view get_name() const override;
    const state* handle_message(context& c, const ptp::v2::sync& message) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const override;
};

class state_waiting_for_sync : public state
{
public:
    std::string_view get_name() const override;
    const state* handle_message(context& /*c*/, const ptp::v2::sync& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const override;
};

class state_waiting_for_follow_up : public state
{
public:
    std::string_view get_name() const override;
    const state* handle_message(context& /*c*/, const ptp::v2::sync& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const override;
};

class state_waiting_for_delay_request : public state
{
public:
    std::string_view get_name() const override;
    const state* handle_message(context& /*c*/, const ptp::v2::sync& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const override;
};

class state_waiting_for_delay_response : public state
{
public:
    std::string_view get_name() const override;
    const state* handle_message(context& /*c*/, const ptp::v2::sync& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const override;
    const state* handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const override;
};

//------------------------------------------------------------------------------
namespace
{
    bool is_same_clock(const context& c, const ptp::v2::message_header_lens& message)
    {
        return c.origin == ptp::origin{ message.clock_identity(), message.subdomain_number() };
    }

    void calculate(const context& c)
    {
        const auto t1 = ptp::to_time_point(c.precise_origin_timestamp);
        const auto t2 = c.last_sync_timestamp;
        const auto t3 = c.delay_request_packet_timestamp;
        const auto t4 = ptp::to_time_point(c.delay_response_origin_timestamp);
        const auto clock_offset = ((t2 - t1) - (t4 - t3)) / 2;
        const auto transmission_delay = ((t2 - t1) + (t4 - t3)) / 2;
        //logger()->info("clock_offset: {}", std::chrono::duration_cast<std::chrono::nanoseconds>(clock_offset).count());
        //logger()->info("transmission_delay: {}", std::chrono::duration_cast<std::chrono::nanoseconds>(transmission_delay).count());

        c.listener->on_data({ c.last_sync_timestamp, clock_offset });
    }
}
//------------------------------------------------------------------------------

std::string_view state_initial::get_name() const { return "initial"; }

const state* state_initial::handle_message(context& c, const ptp::v2::sync& message) const
{
    c.origin.clock_identity = message.header().value().clock_identity();
    c.origin.subdomain_number = message.header().value().subdomain_number();

    c.last_sync_timestamp = message.packet_timestamp();
    c.current_sequence_id = message.header().value().sequence_id();

    return c.waiting_for_follow_up;
}

const state* state_initial::handle_message(context&, const ptp::v2::follow_up&) const { return this; }
const state* state_initial::handle_message(context&, const ptp::v2::delay_req&) const { return this; }
const state* state_initial::handle_message(context&, const ptp::v2::delay_resp&) const { return this; }
const state* state_initial::handle_message(context&, const ptp::v2::other&) const { return this; }

//------------------------------------------------------------------------------

std::string_view state_waiting_for_sync::get_name() const { return "waiting_for_sync"; }

const state* state_waiting_for_sync::handle_message(context& c, const ptp::v2::sync& message) const
{
    if (!is_same_clock(c, message.header().value())) return this;

    c.last_sync_timestamp = message.packet_timestamp();
    c.current_sequence_id = message.header().value().sequence_id();

    return c.waiting_for_follow_up; 
}

const state* state_waiting_for_sync::handle_message(context&, const ptp::v2::follow_up&) const { return this; }
const state* state_waiting_for_sync::handle_message(context&, const ptp::v2::delay_req&) const { return this; }
const state* state_waiting_for_sync::handle_message(context&, const ptp::v2::delay_resp&) const { return this; }
const state* state_waiting_for_sync::handle_message(context&, const ptp::v2::other&) const { return this; }

//------------------------------------------------------------------------------

std::string_view state_waiting_for_follow_up::get_name() const { return "waiting_for_follow_up"; }

const state* state_waiting_for_follow_up::handle_message(context& c, const ptp::v2::sync& message) const 
{ 
    if (!is_same_clock(c, message.header().value())) return this;

    return c.waiting_for_sync->handle_message(c, message);
}

const state* state_waiting_for_follow_up::handle_message(context& c, const ptp::v2::follow_up& message) const 
{
    if (!is_same_clock(c, message.header().value())) return this;

    if (message.header().value().sequence_id() != c.current_sequence_id) return this;

    c.precise_origin_timestamp = message.message().precise_origin_timestamp();
    
    return c.waiting_for_delay_request;
}

const state* state_waiting_for_follow_up::handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const { return this; }
const state* state_waiting_for_follow_up::handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const { return this; }
const state* state_waiting_for_follow_up::handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const { return this; }

//------------------------------------------------------------------------------

std::string_view state_waiting_for_delay_request::get_name() const { return "waiting_for_delay_request"; }

const state* state_waiting_for_delay_request::handle_message(context& c, const ptp::v2::sync& message) const
{
    if (!is_same_clock(c, message.header().value())) return this;

    return c.waiting_for_sync->handle_message(c, message);
}

const state* state_waiting_for_delay_request::handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const { return this; }

const state* state_waiting_for_delay_request::handle_message(context& c, const ptp::v2::delay_req& message) const 
{ 
    c.delay_request_packet_timestamp = message.packet_timestamp();
    c.current_sequence_id = message.header().value().sequence_id();

    return c.waiting_for_delay_response; 
}

const state* state_waiting_for_delay_request::handle_message(context& /*c*/, const ptp::v2::delay_resp& /*message*/) const { return this; }
const state* state_waiting_for_delay_request::handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const { return this; }

//------------------------------------------------------------------------------

std::string_view state_waiting_for_delay_response::get_name() const { return "waiting_for_delay_response"; }

const state* state_waiting_for_delay_response::handle_message(context& c, const ptp::v2::sync& message) const
{
    if (!is_same_clock(c, message.header().value())) return this;

    return c.waiting_for_sync->handle_message(c, message);
}

const state* state_waiting_for_delay_response::handle_message(context& /*c*/, const ptp::v2::follow_up& /*message*/) const { return this; }
const state* state_waiting_for_delay_response::handle_message(context& /*c*/, const ptp::v2::delay_req& /*message*/) const { return this; }

const state* state_waiting_for_delay_response::handle_message(context& c, const ptp::v2::delay_resp& message) const 
{ 
    if (!is_same_clock(c, message.header().value())) return this;

    if (message.header().value().sequence_id() != c.current_sequence_id) return this;
    if (!is_same_clock(c, message.header().value())) return this;

    c.delay_response_origin_timestamp = message.message().receive_timestamp();

    calculate(c);

    return c.waiting_for_sync;
}

const state* state_waiting_for_delay_response::handle_message(context& /*c*/, const ptp::v2::other& /*message*/) const { return this; }

//------------------------------------------------------------------------------

struct state_machine::impl
{
    explicit impl(listener_ptr listener)
        : context_({
            &waiting_for_sync,
            &waiting_for_follow_up,
            &waiting_for_delay_request,
            &waiting_for_delay_response, std::move(listener)}),
        current_state_(&initial_)
    {
        assert(context_.listener);
    }

    template<class MessageType>
    void handle_message_and_switch_state(const MessageType& message)
    {
        assert(current_state_);
        logger()->trace("Received message {} while in state {}", typeid(message).name(), typeid(*current_state_).name());
        const auto new_state = current_state_->handle_message(context_, message);
        assert(new_state);
        if (new_state != current_state_)
        {
            logger()->trace("Switching to state {}", typeid(*new_state).name());
            current_state_ = new_state;
        }
    }

    void operator()(const ptp::v1::message&)
    {
        logger()->trace("v1::message");
    }

    void operator()(const ptp::v2::sync& message)
    {
        logger()->trace("v2::sync");
        handle_message_and_switch_state(message);
    }

    void operator()(const ptp::v2::follow_up& message)
    {
        logger()->trace("v2::follow_up");
        handle_message_and_switch_state(message);
    }

    void operator()(const ptp::v2::delay_req& message)
    {
        logger()->trace("v2::delay_req");
        handle_message_and_switch_state(message);
    }

    void operator()(const ptp::v2::delay_resp& message)
    {
        logger()->trace("v2::delay_resp");
        handle_message_and_switch_state(message);
    }

    void operator()(const ptp::v2::other& message)
    {
        logger()->trace("v2::other");
        handle_message_and_switch_state(message);
    }

    context context_;
    const state* current_state_ = nullptr;
    const state_initial initial_;
    const state_waiting_for_sync waiting_for_sync;
    const state_waiting_for_follow_up waiting_for_follow_up;
    const state_waiting_for_delay_request waiting_for_delay_request;
    const state_waiting_for_delay_response waiting_for_delay_response;
};

state_machine::state_machine(listener_ptr l)
    : impl_(std::make_unique<impl>(l))
{
}

state_machine::state_machine()
    : impl_(std::make_unique<impl>(std::make_shared<null_state_machine_listener>()))
{
}

state_machine::~state_machine() = default;

void state_machine::on_data(ptp::some_message&& message)
{
    std::visit(*impl_, message);
}

void state_machine::on_complete()
{
    impl_->context_.listener->on_complete();
}

void state_machine::on_error(std::exception_ptr e)
{
    impl_->context_.listener->on_error(e);
}
