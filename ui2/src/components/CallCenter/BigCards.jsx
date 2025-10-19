import React from "react";
import { Smile, PhoneMissed, Mic, Archive } from "lucide-react";


const BigCards = () => {
  return (
    <div className="">
      <div className="flex my-5 rounded-md  gap-4 mb-4">
        <div className="flex-1  h-[250px] justify-between border p-4 rounded-lg bg-white flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <Smile
                size={35}
                className="text-white p-2 rounded-lg bg-[#0D9488] "
              />
              <p className="text-gray-400 text-sm">Contact Sentiment</p>
            </div>

            <p className="text-sm text-gray-400">Last 10.2 days</p>
          </div>
        </div>

        <div className="flex-1 h-[250px] border p-4 rounded-lg bg-white flex flex-col ">
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <PhoneMissed 
                size={35}
                className="text-white p-2 rounded-lg bg-red-600 "
              />
              <p className="text-gray-400 text-sm">Hangup Reasons</p>
            </div>

            <p className="text-sm text-gray-400">Last 10.2 days</p>
          </div>
        </div>
      </div>
      <div className="mb-5 flex-1 h-[300px] border p-4 rounded-lg bg-white flex flex-col ">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Archive 
              size={35}
              className="text-white p-2 rounded-lg bg-blue-600 "
            />
            <div className="">

            <p className="text-gray-400 text-sm">Contact Sentiment</p>
            <p className="font-semibold text-lg">0 mins</p>
            </div>
          </div>

          <p className="text-sm text-gray-400">Last 10.2 days</p>
        </div>
      </div>
      <div className="flex-1 h-[300px] border p-4 rounded-lg bg-white flex flex-col ">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Mic
              size={35}
              className="text-white p-2 rounded-lg bg-green-600 "
            />
            <div className="">
              <p className="text-gray-400 text-sm">Call minutes</p>
              <p className="font-semibold text-lg">0 mins</p>
            </div>
          </div>

          <p className="text-sm text-gray-400">Last 10.2 days</p>
        </div>
      </div>
    </div>
  );
};

export default BigCards;
