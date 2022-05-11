import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import './styles.scss';
import LabelYAxis from '../LabelYAxis/LabelYAxis';
import { MinAvgMaxTooltip } from '../index';

interface IComponentProps {
    graphicData: Array<IGraphicMinMaxAvgData>;
    title: string;
    yAxisTitle: string;
    xAxisTitle: string;
    datakeyX: string;
    datakeyY: string[];
    leftMargin: number;
}

function MinMaxAvgLineGraphic({
    data,
    getNewData,
}: {
    data: IComponentProps | undefined;
    getNewData?: (first_packet_ts: string, last_packet_ts: string, numberOfPoints: number, isZoomOut: boolean) => void;
}) {
    if (data === undefined) {
        return null;
    }

    const initialZoomState = {
        dataZoom: data.graphicData,
        refAreaLeft: '',
        refAreaRight: '',
        activeLabelLeft: '',
        activeLabelRight: '',
        animation: true,
    };
    const [zoomState, setZoomState] = React.useState(initialZoomState);

    const CustomTooltip = (props: any) => {
        if (props.active) {
            if (props.payload) {
                if (props.payload[0] === undefined) {
                    return <div></div>;
                }
                return (
                    <MinAvgMaxTooltip
                        valueTime={props.payload[0].payload.time}
                        valueMin={props.payload[0].payload.min}
                        valueAvg={props.payload[0].payload.avg}
                        valueMax={props.payload[0].payload.max}
                    />
                );
            }
        }
        return null;
    };

    const handleZoom = async () => {
        let { refAreaLeft, refAreaRight } = zoomState;
        const { dataZoom } = zoomState;
        const numberOfPoints = parseInt(zoomState.refAreaRight) - parseInt(zoomState.refAreaLeft);

        if (zoomState.activeLabelLeft === '') {
            await getNewData!(zoomState.activeLabelLeft, zoomState.activeLabelRight, numberOfPoints, true);
        } else {
            await getNewData!(zoomState.activeLabelLeft, zoomState.activeLabelRight, numberOfPoints, false);
        }

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setZoomState({
                ...zoomState,
                refAreaLeft: '',
                refAreaRight: '',
                activeLabelLeft: '',
                activeLabelRight: '',
            });
            return;
        }

        if (parseInt(refAreaLeft) > parseInt(refAreaRight)) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        const dataNewZoom = dataZoom.slice(parseInt(refAreaLeft), parseInt(refAreaRight) + 1);
        setZoomState({
            animation: true,
            refAreaLeft: '',
            refAreaRight: '',
            activeLabelLeft: '',
            activeLabelRight: '',
            dataZoom: dataNewZoom,
        });
    };

    const handleZoomOut = async () => {
        const numberOfPoints = parseInt(zoomState.refAreaRight) - parseInt(zoomState.refAreaLeft);

        await getNewData!(zoomState.activeLabelLeft, zoomState.activeLabelRight, numberOfPoints, true);

        setZoomState({
            ...zoomState,
            dataZoom: data.graphicData,
            refAreaLeft: '',
            refAreaRight: '',
            activeLabelLeft: '',
            activeLabelRight: '',
        });
    };

    return (
        <div className="line-graphic-container">
            <div className="blend-div"></div>
            <div className="line-graphic-legend">
                <span>{data.title}</span>
                <div>
                    {data.datakeyY.map((dataKey: string) => {
                        return (
                            <div key={dataKey} className="line-graphic-value-legend">
                                <span className={`line-graphic-value-dot ${dataKey}`}></span>
                                <span className="line-graphic-value-label">
                                    {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="line-graphic" style={{ userSelect: 'none' }}>
                <LabelYAxis title={data.yAxisTitle.charAt(0).toUpperCase() + data.yAxisTitle.slice(1)} />
                <ResponsiveContainer>
                    <LineChart
                        data={zoomState.dataZoom}
                        margin={{ top: 35, right: 25, left: data.leftMargin }}
                        onMouseDown={(e: any) => {
                            e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaLeft:
                                          e.activeTooltipIndex !== undefined ? e.activeTooltipIndex.toString() : '',
                                      activeLabelLeft: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        onMouseMove={(e: any) => {
                            zoomState.refAreaLeft && zoomState.activeLabelLeft && e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaRight:
                                          e.activeTooltipIndex !== undefined ? e.activeTooltipIndex.toString() : '',
                                      activeLabelRight: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        // eslint-disable-next-line react/jsx-no-bind
                        onMouseUp={handleZoom}
                    >
                        <CartesianGrid strokeDasharray="5 10" vertical={false} stroke="#39415A" />
                        <XAxis
                            dataKey={data.datakeyX}
                            axisLine={false}
                            height={50}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#39415A',
                                dy: 10,
                            }}
                            width={0}
                            label={{
                                value: data.xAxisTitle,
                                position: 'insideBottom',
                                dy: 5,
                                style: {
                                    fontFamily: 'Prompt',
                                    fontStyle: 'normal',
                                    fontWeight: 'normal',
                                    fontSize: 14,
                                    fill: '#b5b8c1',
                                },
                            }}
                            onClick={handleZoomOut}
                        />

                        <YAxis
                            domain={['dataMin - 0.25', 'dataMax + 0.25']}
                            axisLine={false}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#39415A',
                                width: 'fit-content',
                                dx: -10,
                            }}
                            width={0}
                        />

                        <Tooltip cursor={false} content={<CustomTooltip />} />

                        {data.datakeyY.map((dataKey: string) => {
                            switch (dataKey) {
                                case 'min':
                                    return (
                                        <Line
                                            key={dataKey}
                                            dataKey={dataKey}
                                            stroke="#96cd39"
                                            animationDuration={300}
                                        />
                                    );
                                case 'avg':
                                    return (
                                        <Line
                                            key={dataKey}
                                            dataKey={dataKey}
                                            stroke="#f5ff65"
                                            animationDuration={300}
                                        />
                                    );
                                case 'max':
                                    return (
                                        <Line
                                            key={dataKey}
                                            dataKey={dataKey}
                                            stroke="#ff5b44"
                                            animationDuration={300}
                                        />
                                    );
                            }
                        })}

                        {zoomState.activeLabelLeft && zoomState.activeLabelRight ? (
                            <ReferenceArea
                                x1={zoomState.activeLabelLeft}
                                x2={zoomState.activeLabelRight}
                                strokeOpacity={0.3}
                            />
                        ) : null}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <button className="zoom-out-graph-button" onClick={handleZoomOut}>
                Zoom Out
            </button>
        </div>
    );
}
export type IGraphicMinMaxAvgData = {
    min: number;
    avg: number;
    max: number;
    time: string;
};

export default MinMaxAvgLineGraphic;
