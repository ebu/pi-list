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

const NUMBER_OF_RENDERED_POINTS = 500;

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

    //Number of points of the initial render
    const [numberOfInitialPoints, setNumberOfInitialPoints] = useState<number>(1);
    const [data, setData] = useState(null);

    const [initialMeasurement, setInitialMeasurement] = useState<string>('');

    //Number of points available from that graph
    const [numberOfPoints, setNumberOfPoints] = useState<number>(1);

    useEffect(() => {
        const fetchCount = async () => {
            let count = await list.stream.getMeasurementCount(state.pcapID, state.measurementType, state.streamID);
            setNumberOfPoints(count.count);
        };

        const fetchFirstData = async () => {
            const numberOfPointsFinal =
                numberOfPoints > NUMBER_OF_RENDERED_POINTS ? NUMBER_OF_RENDERED_POINTS : numberOfPoints;

            let nextState =
                numberOfPointsFinal > 100
                    ? await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Grouped`,
                          state.streamID,
                          state.first_packet_ts,
                          state.last_packet_ts,
                          Math.round(
                              (parseInt(last_packet_ts || '0') - parseInt(first_packet_ts || '0')) / numberOfPointsFinal
                          ).toString()
                      )
                    : await list.stream.getMeasurement(
                          state.pcapID,
                          `${state.measurementType}Raw`,
                          state.streamID,
                          state.first_packet_ts,
                          state.last_packet_ts
                      );

            setInitialMeasurement(
                numberOfPoints > 100 ? `${state.measurementType}Grouped` : `${state.measurementType}Raw`
            );
            setData(nextState);
            console.log(state.streamID);
            console.log('first value', nextState.data[0]);
            setNumberOfInitialPoints(nextState.data.length);
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
        //If it is zoom out we get the initial points to get the same result as the beggining
        const number_of_points_final = isZoomOut ? numberOfInitialPoints : numberOfPointsGraph;

        //If it has more than 150 points we only display NUMBER_OF_RENDERED_POINTS points
        const numberOfPointsCondition =
            number_of_points_final > NUMBER_OF_RENDERED_POINTS ? NUMBER_OF_RENDERED_POINTS : number_of_points_final;

        const grouped_ts = Math.round(
            (parseInt(last_packet_ts_final || '0') - parseInt(first_packet_ts_final || '0')) / numberOfPointsCondition
        ).toString();

        //If it is Zoom out we get the initial state
        const fetchData = isZoomOut
            ? async () => {
                  const numberOfPointsFinal =
                      numberOfPoints > NUMBER_OF_RENDERED_POINTS ? NUMBER_OF_RENDERED_POINTS : numberOfPoints;

                  let nextState =
                      initialMeasurement === `${state.measurementType}Grouped`
                          ? await list.stream.getMeasurement(
                                state.pcapID,
                                `${state.measurementType}Grouped`,
                                state.streamID,
                                first_packet_ts_final,
                                last_packet_ts_final,
                                Math.round(
                                    (parseInt(last_packet_ts_final || '0') - parseInt(first_packet_ts_final || '0')) /
                                        numberOfPointsFinal
                                ).toString()
                            )
                          : await list.stream.getMeasurement(
                                state.pcapID,
                                `${state.measurementType}Raw`,
                                state.streamID,
                                first_packet_ts_final,
                                last_packet_ts_final
                            );

                  setData(nextState);
              }
            : async () => {
                  let nextState =
                      numberOfPointsCondition > NUMBER_OF_RENDERED_POINTS
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
