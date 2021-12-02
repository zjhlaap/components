import styled from 'styled-components';

export const ConeSankeyBox = styled.div`
  width: 924px;
  height: 238px;

`;

export const BarBox = styled.div<{
  height: number;
  bgColor: string;
}>`
  width: 14px;
  background-color: ${props => props.bgColor};
  height: ${props => props.height}px;
`;

export const TooltipBox = styled.div<{
  top: number;
  left: number;
  display: string;
}>`
  background: #4F4F4F;
  border-radius: 2px;
  padding: 6px;
  position: absolute;
  width: auto;
  display: ${props => props.display};
  color: #fff;
  transform: ${props => `translate(${props.left + 20}px, ${props.top}px)`};
  perspective: 1000;
`;

export const CircleColor = styled.span<{ color: string }>`
  background-color: ${props => props.color};
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 10px;
`;
