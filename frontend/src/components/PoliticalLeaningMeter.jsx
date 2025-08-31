import React from 'react';

const PoliticalLeaningMeter = ({ leaning, confidence }) => {
  const getLeaningColor = (leaning) => {
    switch (leaning) {
      case 'Leans Awami League':
        return 'bg-green-500';
      case 'Leans BNP':
        return 'bg-blue-500';
      case 'Leans Jamaat-e-Islami':
        return 'bg-black';
      case 'Leans Jatiya Party':
        return 'bg-yellow-500';
      case 'Leans NCP':
        return 'bg-red-600';
      case 'Neutral':
        return 'bg-gray-500';
      default:
        return 'bg-purple-500';
    }
  };

  const leaningColor = getLeaningColor(leaning);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Political Leaning</h3>
      <div className="relative h-8 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${leaningColor} rounded-full`}
          style={{ width: `${confidence}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow-md">{leaning} ({confidence}%)</span>
        </div>
      </div>
    </div>
  );
};

export default PoliticalLeaningMeter;
