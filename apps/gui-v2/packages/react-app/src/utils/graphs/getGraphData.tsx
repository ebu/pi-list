import { useState, useEffect } from 'react';
import list from 'utils/api';
import { getTimeInNs } from 'utils/graphs/getTimeInNs';

interface IComponentProps {
    pcapID: string;
    streamID: string | undefined;
    measurementType: string;
    first_packet_ts: string | undefined;
    last_packet_ts: string | undefined;
}

export function useGraphData({
    pcapID,
    streamID,
    measurementType,
    first_packet_ts,
    last_packet_ts,
}: IComponentProps): [
    any,
    (
        first_packet_ts: string | undefined,
        last_packet_ts: string | undefined,
        numberOfPointsGraph: number,
        isZoomOut: boolean
    ) => void
] {
    const [state, setState] = useState({
        pcapID,
        streamID,
        measurementType,
        first_packet_ts,
        last_packet_ts,
    });

    const [data, setData] = useState(null);

    const [numberOfPoints, setNumberOfPoints] = useState<number>();

    useEffect(() => {
        const fetchCount = async () => {
            let count = await list.stream.getMeasurementCount(state.pcapID, state.measurementType, state.streamID);
            setNumberOfPoints(count.count);
        };

        const fetchFirstData = async () => {
            let nextState =
                numberOfPoints! > 20
                    ? await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Grouped`,
                          state.streamID,
                          state.first_packet_ts,
                          state.last_packet_ts,
                          Math.round(
                              (parseInt(last_packet_ts || '0') - parseInt(first_packet_ts || '0')) /
                                  (numberOfPoints! / 2)
                          ).toString()
                      )
                    : await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Raw`,
                          state.streamID,
                          state.first_packet_ts,
                          state.last_packet_ts
                      );
            setData(nextState);
        };

        fetchCount().finally(() => {
            fetchFirstData();
        });
    }, [state.streamID, numberOfPoints]);

    function fetchDataCallback(
        first_packet_ts: string | undefined,
        last_packet_ts: string | undefined,
        numberOfPointsGraph: number,
        isZoomOut: boolean
    ) {
        const first_packet_ts_final = isZoomOut ? state.first_packet_ts : getTimeInNs(first_packet_ts!).toString();
        const last_packet_ts_final = isZoomOut ? state.last_packet_ts : getTimeInNs(last_packet_ts!).toString();
        const number_of_points_final = isZoomOut ? 10 : numberOfPoints! / 3;

        const grouped_ts = Math.round(
            (parseInt(last_packet_ts_final || '0') - parseInt(first_packet_ts_final || '0')) / number_of_points_final
        ).toString();

        const fetchData = async () => {
            let nextState =
                numberOfPointsGraph! > 50 || isZoomOut
                    ? await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Grouped`,
                          state.streamID,
                          first_packet_ts_final,
                          last_packet_ts_final,
                          grouped_ts
                      )
                    : await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Raw`,
                          state.streamID,
                          first_packet_ts_final,
                          last_packet_ts_final
                      );

            setData(nextState);
        };

        fetchData();
    }

    return [data, fetchDataCallback];
}
