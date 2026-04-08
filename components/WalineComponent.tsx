import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import type { WalineInitOptions, WalineInstance } from '@waline/client';

import '@waline/client/style';

export type WalineOptions = Omit<WalineInitOptions, 'el'>;

export const WalineComponent: React.FC<WalineOptions> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const walineInstanceRef = useRef<WalineInstance | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      walineInstanceRef.current = init({
        ...props,
        el: containerRef.current,
      });
    }

    return () => {
      walineInstanceRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update(props);
  }, [props]);

  return <div ref={containerRef} />;
};

export default WalineComponent;
