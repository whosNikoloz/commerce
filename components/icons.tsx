import * as React from "react";

import { IconSvgProps } from "@/types";

export const Logo: React.FC<IconSvgProps> = ({ size = 36, width, height, ...props }) => (
  <svg fill="none" height={size || height} viewBox="0 0 32 32" width={size || width} {...props}>
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const HomeIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    fill="none"
    height={height || size}
    viewBox="0 0 24 24"
    width={width || size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <path
        d="M6.49996 7C7.96131 5.53865 9.5935 4.41899 10.6975 3.74088C11.5021 3.24665 12.4978 3.24665 13.3024 3.74088C14.4064 4.41899 16.0386 5.53865 17.5 7C20.6683 10.1684 20.5 12 20.5 15C20.5 16.4098 20.3895 17.5988 20.2725 18.4632C20.1493 19.3726 19.3561 20 18.4384 20H17C15.8954 20 15 19.1046 15 18V16C15 15.2043 14.6839 14.4413 14.1213 13.8787C13.5587 13.3161 12.7956 13 12 13C11.2043 13 10.4413 13.3161 9.87864 13.8787C9.31603 14.4413 8.99996 15.2043 8.99996 16V18C8.99996 19.1046 8.10453 20 6.99996 20H5.56152C4.64378 20 3.85061 19.3726 3.72745 18.4631C3.61039 17.5988 3.49997 16.4098 3.49997 15C3.49997 12 3.33157 10.1684 6.49996 7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </g>
  </svg>
);

export const IconCheck = ({
  size,
  height,
  width,
  color,
}: {
  size?: number;
  height?: number;
  width?: number;
  color?: string;
}) => {
  return (
    <svg
      fill={color || "currentColor"}
      height={size || height || 16}
      viewBox="0 0 256 256"
      width={size || width || 16}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
};
export const ProfileIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    fill="none"
    height={height || size}
    viewBox="0 0 24 24"
    width={width || size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <g id="style=linear">
        <g id="profile">
          <path
            d="M12 11C14.4853 11 16.5 8.98528 16.5 6.5C16.5 4.01472 14.4853 2 12 2C9.51472 2 7.5 4.01472 7.5 6.5C7.5 8.98528 9.51472 11 12 11Z"
            id="vector"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M5 18.5714C5 16.0467 7.0467 14 9.57143 14H14.4286C16.9533 14 19 16.0467 19 18.5714C19 20.465 17.465 22 15.5714 22H8.42857C6.53502 22 5 20.465 5 18.5714Z"
            id="rec"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const MoonFilledIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const HeartFilledIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const ShoppingCartIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    fill="none"
    height={height || size}
    viewBox="0 0 24 24"
    width={width || size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <path
        d="M2.23737 2.28845C1.84442 2.15746 1.41968 2.36983 1.28869 2.76279C1.15771 3.15575 1.37008 3.58049 1.76303 3.71147L2.02794 3.79978C2.70435 4.02524 3.15155 4.17551 3.481 4.32877C3.79296 4.47389 3.92784 4.59069 4.01426 4.71059C4.10068 4.83049 4.16883 4.99538 4.20785 5.33722C4.24907 5.69823 4.2502 6.17 4.2502 6.883L4.2502 9.55484C4.25018 10.9224 4.25017 12.0247 4.36673 12.8917C4.48774 13.7918 4.74664 14.5497 5.34855 15.1516C5.95047 15.7535 6.70834 16.0124 7.60845 16.1334C8.47542 16.25 9.57773 16.25 10.9453 16.25H18.0002C18.4144 16.25 18.7502 15.9142 18.7502 15.5C18.7502 15.0857 18.4144 14.75 18.0002 14.75H11.0002C9.56479 14.75 8.56367 14.7484 7.80832 14.6468C7.07455 14.5482 6.68598 14.3677 6.40921 14.091C6.17403 13.8558 6.00839 13.5398 5.9034 13H16.0222C16.9817 13 17.4614 13 17.8371 12.7522C18.2128 12.5045 18.4017 12.0636 18.7797 11.1817L19.2082 10.1817C20.0177 8.2929 20.4225 7.34849 19.9779 6.67422C19.5333 5.99996 18.5058 5.99996 16.4508 5.99996H5.74526C5.73936 5.69227 5.72644 5.41467 5.69817 5.16708C5.64282 4.68226 5.52222 4.2374 5.23112 3.83352C4.94002 3.42965 4.55613 3.17456 4.1137 2.96873C3.69746 2.7751 3.16814 2.59868 2.54176 2.38991L2.23737 2.28845Z"
        fill="currentColor"
      />
      <path
        d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
        fill="currentColor"
      />
      <path
        d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export const GeorgiaIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    className="iconify iconify--twemoji"
    fill="#000000"
    height={size || height}
    preserveAspectRatio="xMidYMid meet"
    role="img"
    viewBox="0 0 36 36"
    width={size || width}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <path d="M32 5H20.5v10.5H36V9a4 4 0 0 0-4-4z" fill="#EEE" />
      <path d="M20.5 5h-5v10.5H0v5h15.5V31h5V20.5H36v-5H20.5z" fill="#E8112D" />
      <path
        d="M28.915 9.585a13.58 13.58 0 0 1 .221-1.86a7.18 7.18 0 0 1-1.77 0c.117.615.19 1.237.221 1.86a13.58 13.58 0 0 1-1.86-.221a7.18 7.18 0 0 1 0 1.77a13.56 13.56 0 0 1 1.86-.221a13.58 13.58 0 0 1-.221 1.86a7.18 7.18 0 0 1 1.77 0a13.56 13.56 0 0 1-.221-1.86a13.58 13.58 0 0 1 1.86.221a7.18 7.18 0 0 1 0-1.77c-.616.118-1.237.191-1.86.221z"
        fill="#E8112D"
      />
      <path d="M15.5 5H4a4 4 0 0 0-4 4v6.5h15.5V5z" fill="#EEE" />
      <path
        d="M8.415 9.585a13.58 13.58 0 0 1 .221-1.86a7.18 7.18 0 0 1-1.77 0c.117.615.19 1.237.221 1.86a13.58 13.58 0 0 1-1.86-.221a7.18 7.18 0 0 1 0 1.77a13.56 13.56 0 0 1 1.86-.221a13.58 13.58 0 0 1-.221 1.86a7.18 7.18 0 0 1 1.77 0a13.56 13.56 0 0 1-.221-1.86a13.58 13.58 0 0 1 1.86.221a7.18 7.18 0 0 1 0-1.77c-.616.118-1.237.191-1.86.221z"
        fill="#E8112D"
      />
      <path d="M36 27v-6.5H20.5V31H32a4 4 0 0 0 4-4z" fill="#EEE" />
      <path
        d="M28.915 26.415c.031.623.104 1.244.221 1.86a7.18 7.18 0 0 0-1.77 0c.117-.615.19-1.237.221-1.86a13.58 13.58 0 0 0-1.86.221a7.18 7.18 0 0 0 0-1.77c.615.117 1.237.19 1.86.221a13.58 13.58 0 0 0-.221-1.86a7.18 7.18 0 0 0 1.77 0a13.56 13.56 0 0 0-.221 1.86a13.58 13.58 0 0 0 1.86-.221a7.18 7.18 0 0 0 0 1.77a13.274 13.274 0 0 0-1.86-.221z"
        fill="#E8112D"
      />
      <path d="M15.5 20.5H0V27a4 4 0 0 0 4 4h11.5V20.5z" fill="#EEE" />
      <path
        d="M8.415 26.415c.031.623.104 1.244.221 1.86a7.18 7.18 0 0 0-1.77 0c.117-.615.19-1.237.221-1.86a13.58 13.58 0 0 0-1.86.221a7.18 7.18 0 0 0 0-1.77c.615.117 1.237.19 1.86.221a13.58 13.58 0 0 0-.221-1.86a7.18 7.18 0 0 0 1.77 0a13.56 13.56 0 0 0-.221 1.86a13.58 13.58 0 0 0 1.86-.221a7.18 7.18 0 0 0 0 1.77a13.274 13.274 0 0 0-1.86-.221z"
        fill="#E8112D"
      />
    </g>
  </svg>
);

export const EnglishIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    fill="#000000"
    height={size || height}
    id="Layer_1"
    version="1.1"
    viewBox="0 0 512 512"
    width={size || width}
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M473.655,88.276H38.345C17.167,88.276,0,105.443,0,126.621V385.38 c0,21.177,17.167,38.345,38.345,38.345h435.31c21.177,0,38.345-17.167,38.345-38.345V126.621 C512,105.443,494.833,88.276,473.655,88.276z"
        style={{ fill: "#41479B" }}
      />{" "}
      <path
        d="M511.469,120.282c-3.022-18.159-18.797-32.007-37.814-32.007h-9.977l-163.54,107.147V88.276h-88.276 v107.147L48.322,88.276h-9.977c-19.017,0-34.792,13.847-37.814,32.007l139.778,91.58H0v88.276h140.309L0.531,391.717 c3.022,18.159,18.797,32.007,37.814,32.007h9.977l163.54-107.147v107.147h88.276V316.577l163.54,107.147h9.977 c19.017,0,34.792-13.847,37.814-32.007l-139.778-91.58H512v-88.276H371.691L511.469,120.282z"
        style={{ fill: "#F5F5F5" }}
      />{" "}
      <g>
        {" "}
        <polygon
          points="282.483,88.276 229.517,88.276 229.517,229.517 0,229.517 0,282.483 229.517,282.483 229.517,423.724 282.483,423.724 282.483,282.483 512,282.483 512,229.517 282.483,229.517 "
          style={{ fill: "#FF4B55" }}
        />{" "}
        <path
          d="M24.793,421.252l186.583-121.114h-32.428L9.224,410.31 C13.377,415.157,18.714,418.955,24.793,421.252z"
          style={{ fill: "#FF4B55" }}
        />{" "}
        <path
          d="M346.388,300.138H313.96l180.716,117.305c5.057-3.321,9.277-7.807,12.287-13.075L346.388,300.138z"
          style={{ fill: "#FF4B55" }}
        />{" "}
        <path
          d="M4.049,109.475l157.73,102.387h32.428L15.475,95.842C10.676,99.414,6.749,104.084,4.049,109.475z"
          style={{ fill: "#FF4B55" }}
        />{" "}
        <path
          d="M332.566,211.862l170.035-110.375c-4.199-4.831-9.578-8.607-15.699-10.86L300.138,211.862H332.566z"
          style={{ fill: "#FF4B55" }}
        />{" "}
      </g>{" "}
    </g>
  </svg>
);
