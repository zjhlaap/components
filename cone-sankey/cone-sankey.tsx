import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TooltipBox, CircleColor } from './styled';

const randomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    colorA: `rgb(${r}, ${g}, ${b}, 0.2)`,
  };
};

interface IConeSankey {
  data: { [key: string]: number };
  total: number;
}

const HEIGHT = 238;

const SQUARE_WIDTH = 14;

const CANVAS_WIDTH = 924;

const CANVAS_HEIGHT = 300;

const ConeSankey: React.FC<IConeSankey> = ({
  data,
  total,
}) => {
  const recordPosition = useRef<any>([]);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    display: 'none',
    color: '',
    data: 0,
  });

  const [rate, setRate] = useState<number | string>('');

  const reduceColor = useCallback(({
    currentData,
    length,
    nextData,
    currentIndex,
  }: {
    currentData: number;
    length: number;
    currentIndex: number;
    nextData?: number;
  }) => {
    const calcX = (currentHeight: number) => (CANVAS_HEIGHT - currentHeight) / 2;
    const calcHeight = (datas: number) => HEIGHT * (datas / total);

    const currentHeight = calcHeight(currentData);
    const width = (CANVAS_WIDTH - 24) / length;
    const currentX = currentIndex * width;
    const currentY = calcX(currentHeight);
    const canvas: HTMLCanvasElement | null = document.getElementById('canvas-cone-sankey') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');
    const randomRgba = randomColor();
    ctx?.beginPath();
    ctx!.fillStyle = randomRgba.color;
    ctx?.fillRect(currentX, currentY, SQUARE_WIDTH, currentHeight);
    const rightX = currentX + SQUARE_WIDTH;
    recordPosition.current.push({
      index: currentIndex,
      x: [currentX, rightX],
      y: [currentY, currentY + currentHeight],
      color: randomRgba.color,
      data: currentData,
    });
    ctx?.fill();
    ctx?.closePath();
    ctx?.stroke();
    if (nextData) {
      const ctx2 = canvas?.getContext('2d');
      const nextHeight = calcHeight(nextData);
      const nextX = (currentIndex + 1) * width;
      const nextY = calcX(nextHeight);
      ctx2?.beginPath();
      ctx2!.fillStyle = randomRgba.colorA;
      ctx2!.strokeStyle = randomRgba.colorA;
      ctx2?.moveTo(currentX + SQUARE_WIDTH, currentY); // 左上
      ctx2?.lineTo(nextX, nextY); // 右上
      ctx2?.lineTo(nextX, nextY + nextHeight); // 右下
      ctx2?.lineTo(currentX + SQUARE_WIDTH, currentY + currentHeight); // 作下\
      ctx2?.fill();
      ctx2?.closePath();
      ctx2?.stroke();
    }
  }, [total]);
  useLayoutEffect(() => {
    recordPosition.current = [];
    const canvas: HTMLCanvasElement | null = document.getElementById('canvas-cone-sankey') as HTMLCanvasElement | null;
    const dataKey = Object.keys(data);
    dataKey.forEach((item, index) => {
      const currentData = data[item];
      if (currentData) {
        const nextData = data[dataKey[index + 1]];
        reduceColor({
          currentData,
          length: Object.keys(data).length,
          nextData,
          currentIndex: index,
        });
      }
    });
    canvas!.onmousemove = (e: any) => {
      const client = canvas?.getBoundingClientRect();
      const x = (e.clientX - client!.left) * (canvas!.width / client!.width);
      const y = (e.clientY - client!.top) * (canvas!.height / client!.height);
      let index = -1;
      let color = '';
      let selectedData = 0;
      recordPosition.current?.forEach((item: any) => {
        if (x >= item.x[0] && x <= item.x[1] && y >= item.y[0] && y <= item.y[1]) {
          index = item.index;
          color = item.color;
          selectedData = item.data;
        }
      });
      if (index > -1) {
        setPosition({
          // x: e.clientX || 0,
          x: e.clientX - client!.left,
          y,
          display: 'block',
          color,
          data: selectedData,
        });
      } else {
        setPosition({
          x,
          y,
          display: 'none',
          color,
          data: selectedData,
        });
      }
    };
  }, [data, reduceColor]);

  useEffect(() => {
    const rateData = total === 0 ? 0 : ((position.data / total) * 100).toFixed(2);
    setRate(rateData);
  }, [total, position.data]);

  return (
    <div style={{ position: 'relative' }}>
      <TooltipBox top={position.y} left={position.x} display={position.display}>
        <CircleColor color={position.color} />
        <span>{`Leads: ${position.data} (${rate}%)`}</span>
      </TooltipBox>
      <canvas
        id="canvas-cone-sankey"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: 924, height: 300 }}
      />
    </div>
  );
};

export default ConeSankey;
