import React from 'react';
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Cell,
    Label,
} from 'recharts';
import './styles.scss';
import { ComplianceTag, SimpleTooltip, LabelYAxis, IComplianceProps, TimeValueTooltip } from '../index';
interface IReferenceLines {
    value: number;
    label: string;
}

interface IComponentProps {
    barGraphic: Array<IBarGraphic>;
    referenceLines?: Array<IReferenceLines>;
    complianceInfo?: IComplianceProps;
    title: string;
    yAxisTitle: string;
    xAxisTitle: string;
    datakeyX: string;
    datakeyY: string;
    leftMargin?: number;
}

function BarGraphic({ barGraphicData }: { barGraphicData: IComponentProps }) {
    const [activeIndex, setActiveIndex] = React.useState<Number | null>(null);

    const CustomTooltip = (props: any) => {
        if (props.active) {
            if (props.payload) {
                if (props.payload[0] === undefined) {
                    return <div></div>;
                }
                return (
                    <TimeValueTooltip
                        valueY={props.payload[0].value}
                        valueYLabel={barGraphicData.datakeyY.charAt(0).toUpperCase() + barGraphicData.datakeyY.slice(1)}
                        valueX={props.label}
                        valueXLabel={barGraphicData.xAxisTitle}
                    />
                );
            }
        }
        return null;
    };

    const CustomLabel = (props: any) => {
        const { x, y, stroke, value, label } = props;
        return (
            <g>
                <foreignObject x={props.viewBox.x - 10} y={props.viewBox.y - 9} width={50} height={18}>
                    <div className="bar-graphic-custom-label">{label}</div>
                </foreignObject>
            </g>
        );
    };

    const handleMouseOver = (data: any, index: number) => {
        setActiveIndex(index);
    };

    const handleMouseOut = () => {
        setActiveIndex(null);
    };

    return (
        <div className="bar-graphic-container">
            <div className="blend-div"></div>
            <div className="bar-graphic-legend">
                <span>{barGraphicData.title}</span>
                {barGraphicData.complianceInfo && (
                    <ComplianceTag
                        tagInformation={{
                            text: barGraphicData.complianceInfo.text,
                            compliant: barGraphicData.complianceInfo.compliant,
                        }}
                    />
                )}
            </div>
            <div className="bar-graphic">
                <LabelYAxis
                    title={barGraphicData.yAxisTitle.charAt(0).toUpperCase() + barGraphicData.yAxisTitle.slice(1)}
                />
                <ResponsiveContainer>
                    <BarChart
                        data={barGraphicData.barGraphic}
                        margin={{
                            top: 35,
                            right: 30,
                            left: barGraphicData.leftMargin === undefined ? 0 : barGraphicData.leftMargin,
                        }}
                        stackOffset={'expand'}
                    >
                        <CartesianGrid strokeDasharray="5 10" vertical={false} stroke="#39415A" />
                        <XAxis
                            dataKey={barGraphicData.datakeyX}
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
                            strokeWidth="0px"
                            label={{
                                value: barGraphicData.xAxisTitle,
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
                        />
                        <YAxis
                            dataKey={barGraphicData.datakeyY}
                            axisLine={false}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#39415A',
                                dx: -10,
                            }}
                            interval="preserveStart"
                            strokeWidth="0px"
                        />
                        )
                        <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                        {barGraphicData.referenceLines &&
                            barGraphicData.referenceLines.map((item, index) => (
                                <ReferenceLine strokeDasharray="5 10" y={item.value} stroke="#39415A" key={index}>
                                    <Label content={<CustomLabel label={item.label} />} />
                                </ReferenceLine>
                            ))}
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            onMouseOver={handleMouseOver}
                            onMouseOut={handleMouseOut}
                            minPointSize={3}
                        >
                            {barGraphicData.barGraphic.map((entry: IBarGraphic, index: number) => {
                                //Case it has values bellow 0
                                // if (entry.value < 0) {
                                //     return (
                                //         <Cell
                                //             cursor="pointer"
                                //             fill={index === activeIndex ? '#FF4747' : '#0F1A47'}
                                //             key={`cell-${index}`}
                                //         />
                                //     );
                                // }
                                // return (
                                //     <Cell
                                //         cursor="pointer"
                                //         fill={index === activeIndex ? '#1DAF69' : '#0F1A47'}
                                //         key={`cell-${index}`}
                                //     />
                                // );

                                return (
                                    <Cell
                                        cursor="pointer"
                                        fill={'#0066CC'}
                                        stroke={'#FFFFFF'}
                                        strokeWidth={index === activeIndex ? 2 : 0}
                                        key={`cell-${index}`}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export interface IBarGraphic {
    value: number;
    label: string;
}

export default BarGraphic;
