import React from 'react';

interface WarningBannerProps {
  visible: boolean;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ visible }) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-warning text-white font-bold text-center py-2 transition-transform duration-500 ${
        visible ? 'translate-y-7' : '-translate-y-full'
      }`}
    >
      Finish your hand first!
    </div>
  );
};

export default WarningBanner;
