import React from "react";

const BigCards = () => {
  return (
    <div className="">
      <div className="flex my-5 rounded-md  gap-4 mb-4">
        <div className="flex-1 h-[250px] border p-4 rounded-lg bg-white flex flex-col justify-center items-center">
          <div className="text-lg font-bold"></div>
          <div className="text-yellow-600 text-sm">Appointments</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>

        <div className="flex-1 h-[250px] border p-4 rounded-lg bg-white flex flex-col justify-center items-center">
          <div className="text-lg font-bold"></div>
          <div className="text-yellow-600 text-sm">Appointments</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>
      </div>
      <div className="mb-5 flex-1 h-[300px] border p-4 rounded-lg bg-white flex flex-col justify-center items-center">
        <div className="text-lg font-bold"></div>
        <div className="text-yellow-600 text-sm">Appointments</div>
        <div className="text-yellow-600 text-xs">0%</div>
      </div>
      <div className="flex-1 h-[300px] border p-4 rounded-lg bg-white flex flex-col justify-center items-center">
        <div className="text-lg font-bold"></div>
        <div className="text-yellow-600 text-sm">Appointments</div>
        <div className="text-yellow-600 text-xs">0%</div>
      </div>
    </div>
  );
};

export default BigCards;
