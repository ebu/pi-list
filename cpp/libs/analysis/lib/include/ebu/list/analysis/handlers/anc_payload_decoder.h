/*
 * Copyright (C) 2020 European Broadcasting Union - Technology & Innovation
 * Copyright (C) 2020 CBC / Radio-Canada
 */

#include "ebu/list/st2110/d40/anc_description.h"

#pragma GCC diagnostic ignored "-Wpedantic"
#include <libklvanc/vanc.h>
#pragma GCC diagnostic pop

typedef int (*callback_klvanc_smpte_12_2_t)(void*, struct klvanc_context_s*, struct klvanc_packet_smpte_12_2_s*);

int cb_smpte_12_2(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                  struct klvanc_packet_smpte_12_2_s* pkt);
int cb_eia_708(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
               struct klvanc_packet_eia_708b_s* pkt);
int cb_afd(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx, struct klvanc_packet_afd_s* pkt);
int cb_scte_104(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                struct klvanc_packet_scte_104_s* pkt);
