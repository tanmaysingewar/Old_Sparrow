import React from "react";

export default function Spinner() {
  return (
    <div className="flex">
      {/* classname is not there then set w-5 h-5 */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300"></div>
      </div>
    </div>
  );
}

// Define the keyframes in your tailwind.config.js
// @keyframes rotate-one {
//   0% {
//     transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
//   }
//   100% {
//     transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
//   }
// }
//
// @keyframes rotate-two {
//   0% {
//     transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
//   }
//   100% {
//     transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
//   }
// }
//
// @keyframes rotate-three {
//   0% {
//     transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
//   }
//   100% {
//     transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
//   }
// }
