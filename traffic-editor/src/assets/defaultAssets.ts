import type { Asset } from '../types';

// Simple SVG helpers
const roadSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23555'/%3E%3Cpath d='M50 0 L50 100' stroke='white' stroke-width='2' stroke-dasharray='10,10'/%3E%3C/svg%3E`;
const roadDoubleLineSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23555'/%3E%3Cpath d='M47 0 L47 100' stroke='white' stroke-width='2'/%3E%3Cpath d='M53 0 L53 100' stroke='white' stroke-width='2'/%3E%3C/svg%3E`;
const roadSingleLineSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23555'/%3E%3Cpath d='M50 0 L50 100' stroke='white' stroke-width='2'/%3E%3C/svg%3E`;
const roundaboutSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='%23555' stroke='%23333' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='50' fill='none' stroke='white' stroke-width='2' stroke-dasharray='10,10'/%3E%3Ccircle cx='100' cy='100' r='30' fill='%234caf50' stroke='%23333' stroke-width='2'/%3E%3C/svg%3E`;
const sidewalkSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='30' viewBox='0 0 100 30'%3E%3Crect width='100' height='30' fill='%23ccc'/%3E%3Cline x1='0' y1='0' x2='100' y2='0' stroke='%23999' stroke-width='2'/%3E%3Cline x1='0' y1='28' x2='100' y2='28' stroke='%23999' stroke-width='2'/%3E%3Cline x1='25' y1='0' x2='25' y2='30' stroke='%23bbb' stroke-width='1'/%3E%3Cline x1='50' y1='0' x2='50' y2='30' stroke='%23bbb' stroke-width='1'/%3E%3Cline x1='75' y1='0' x2='75' y2='30' stroke='%23bbb' stroke-width='1'/%3E%3C/svg%3E`;

const intersectionSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23555'/%3E%3C/svg%3E`;

const carRedSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='80' viewBox='0 0 40 80'%3E%3Crect width='40' height='80' rx='5' fill='%23e74c3c'/%3E%3Crect x='5' y='10' width='30' height='15' rx='2' fill='%23333'/%3E%3Crect x='5' y='55' width='30' height='15' rx='2' fill='%23333'/%3E%3C/svg%3E`;
const carBlueSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='80' viewBox='0 0 40 80'%3E%3Crect width='40' height='80' rx='5' fill='%233498db'/%3E%3Crect x='5' y='10' width='30' height='15' rx='2' fill='%23333'/%3E%3Crect x='5' y='55' width='30' height='15' rx='2' fill='%23333'/%3E%3C/svg%3E`;

const signStopSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Cpolygon points='30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30' fill='%23c0392b'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='35' fill='white' text-anchor='middle'%3ESTOP%3C/text%3E%3C/svg%3E`;

const arrowStraightSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='100' viewBox='0 0 30 100'%3E%3Cline x1='15' y1='100' x2='15' y2='10' stroke='black' stroke-width='8'/%3E%3Cpolygon points='15,0 30,20 0,20' fill='black'/%3E%3C/svg%3E`;
const arrowCurvedRightSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cpath d='M20 100 Q 20 20 90 20' stroke='black' stroke-width='10' fill='none'/%3E%3Cpolygon points='100,20 80,10 80,30' fill='black'/%3E%3C/svg%3E`;
const arrowTurnLeftSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cpath d='M80 100 Q 80 20 10 20' stroke='black' stroke-width='10' fill='none'/%3E%3Cpolygon points='0,20 20,10 20,30' fill='black'/%3E%3C/svg%3E`;

const textIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='5' fill='%23eee' stroke='%23bbb' stroke-width='2'/%3E%3Ctext x='20' y='30' font-family='Arial' font-size='30' fill='%23333' text-anchor='middle' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E`;

export const DEFAULT_ASSETS: Asset[] = [
  { id: 'road-straight', name: 'dashed_road', type: 'road', label: 'Dashed Road', src: roadSvg, width: 100, height: 100 },
  { id: 'road-double', name: 'double_line_road', type: 'road', label: 'Double Line', src: roadDoubleLineSvg, width: 100, height: 100 },
  { id: 'road-single', name: 'single_line_road', type: 'road', label: 'Single Line', src: roadSingleLineSvg, width: 100, height: 100 },
  { id: 'road-roundabout', name: 'roundabout', type: 'road', label: 'Roundabout', src: roundaboutSvg, width: 200, height: 200 },
  { id: 'road-intersection', name: 'intersection', type: 'road', label: 'Intersection', src: intersectionSvg, width: 100, height: 100 },
  { id: 'sidewalk', name: 'sidewalk', type: 'road', label: 'Sidewalk', src: sidewalkSvg, width: 100, height: 30 },
  { id: 'car-red', name: 'red_car', type: 'vehicle', label: 'Red Car', src: carRedSvg, width: 40, height: 80 },
  { id: 'car-blue', name: 'blue_car', type: 'vehicle', label: 'Blue Car', src: carBlueSvg, width: 40, height: 80 },
  { id: 'sign-stop', name: 'stop_sign', type: 'sign', label: 'Stop Sign', src: signStopSvg, width: 40, height: 40 },
  
  // Annotations
  { id: 'arrow-straight', name: 'arrow_straight', type: 'annotation', label: 'Straight Arrow', src: arrowStraightSvg, width: 30, height: 100 },
  { id: 'arrow-right', name: 'arrow_right', type: 'annotation', label: 'Right Turn', src: arrowCurvedRightSvg, width: 60, height: 60 },
  { id: 'arrow-left', name: 'arrow_left', type: 'annotation', label: 'Left Turn', src: arrowTurnLeftSvg, width: 60, height: 60 },
  
  // Text
  { id: 'text-box', name: 'text_box', type: 'text', label: 'Text Box', src: textIcon, width: 100, height: 40, textContent: 'Double click to edit' },
];
