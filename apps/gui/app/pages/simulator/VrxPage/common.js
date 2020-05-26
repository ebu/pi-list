import { schedule } from './types';

export const pixels_per_pgroup = 2;

export const get_n_packets = flowSettings => {
    const factor = flowSettings.interlaced ? 2 : 1;
    const pixels_per_frame = (flowSettings.width * flowSettings.height) / factor;
    const pgroups_per_frame = pixels_per_frame / pixels_per_pgroup;
    const packets_per_frame = Math.ceil(pgroups_per_frame / flowSettings.pgroupsPerPacket);
    return packets_per_frame;
};

export const get_ractive = flowSettings => {
    if (flowSettings.schedule == schedule.linear) return 1;

    if (flowSettings.interlaced) {
        // ST2110-21, 6.3.3 Gapped PRS Interlaced and PsF Images
        if (flowSettings.height < 576) {
            return 487.0 / 525;
        }
        if (flowSettings.height < 1080) {
            return 576.0 / 625;
        }
        // assert(flowSettings.height == 1080);
        return 1080.0 / 1125;
    }
    // ST2110-21, 6.3.2 Gapped PRS Progressive Images
    return 1080.0 / 1125;
};

export const get_tro_default_multiplier = flowSettings => {
    if (flowSettings.interlaced) {
        // ST2110-21, 6.3.3 Gapped PRS Interlaced and PsF Images
        if (flowSettings.height < 576) {
            return 20.0 / 525;
        }
        if (flowSettings.height < 1080) {
            return 26.0 / 625;
        }

        // assert(flowSettings.height == 1080);
        return 22.0 / 1125;
    }

    // ST2110-21, 6.3.2 Gapped PRS Progressive Images
    if (flowSettings.height < 1080) {
        return 28.0 / 750;
    }

    return 43.0 / 1125;
};

export const get_tro_default = flowSettings => {
    const interlaced_multiplier = flowSettings.interlaced ? 2 : 1;

    return get_tro_default_multiplier(flowSettings) * flowSettings.Tframe * interlaced_multiplier;
};

export const get_read_schedule = flowSettings => {
    const n_packets = get_n_packets(flowSettings);

    const rs = {};
    rs.trs = (flowSettings.Tframe * get_ractive(flowSettings)) / n_packets;
    rs.tro = get_tro_default(flowSettings);

    return rs;
};

export const modulusTS = n => n % 0x100000000;
export const modulusSN = n => n % 0x100000000;
