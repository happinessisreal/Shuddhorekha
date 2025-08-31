import React from 'react';
import GaugeChart from 'react-gauge-chart';

const Gauge = ({ value, title }) => {
  const percent = value / 10;
  const colors = ['#FF5F5F', '#FFC371', '#4CAF50'];
  const style = {
    width: '100%',
  };

  return (
    <div className="text-center">
      <GaugeChart
        id={`gauge-chart-${title}`}
        nrOfLevels={10}
        colors={colors}
        arcWidth={0.3}
        percent={percent}
        textColor={'#000000'}
        needleColor="#345243"
        needleBaseColor="#345243"
        hideText={true}
        style={style}
      />
      <p className="text-lg font-semibold mt-2">{title}</p>
      <p className="text-2xl font-bold">{value.toFixed(1)}/10</p>
    </div>
  );
};

export default Gauge;
