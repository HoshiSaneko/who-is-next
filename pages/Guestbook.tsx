import React from 'react';
import WalineComponent from '../components/WalineComponent';

const Guestbook: React.FC = () => {
  return (
    <div className="w-full max-w-[800px] mx-auto px-6 py-12 md:py-20 animate-fade-in">
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-[0.2em] text-[#333333] mb-4">留 言</h1>
        <div className="w-12 h-[2px] bg-[#88B090] mx-auto mb-6"></div>
        <p className="text-[#555555] tracking-[0.1em] text-sm leading-relaxed">
          言辞如风，亦能生花<br />
          愿在此处，相逢皆是温良
        </p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-6 md:p-10 border border-[#E5E5E5] shadow-sm">
        <WalineComponent
          serverURL="https://xygss-waline.saneko.me"
          path="/guestbook"
          reaction={false}
          pageSize={10}
          dark={false}
          emoji={[
            'https://unpkg.com/@waline/emojis@1.2.0/bilibili',
            'https://unpkg.com/@waline/emojis@1.2.0/weibo',
          ]}
        />
      </div>
    </div>
  );
};

export default Guestbook;
