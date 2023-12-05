import React from 'react'
import Image from 'next/image';
import Router from 'next/router';

export default function BanPage() {
    const router = Router;
  return (
    <div className="flex items-center justify-center w-full h-screen overflow-hidden">
     <div className="flex items-center justify-center w-[700px] h-[500px] overflow-hidden rounded-xl">
       <div className="relative w-[706px] h-[521px] left-[-6px]">
         <div className="absolute w-[700px] h-[500px] top-0 left-[6px] bg-jasmine rounded-xl" />
         <div className="absolute top-[110px] left-[152px] font-medium text-grass text-[40px] tracking-[0] leading-[normal] font-shining p-10 justify-center">
           You Are Banned due to multiple violations
         </div>

         <div className="absolute w-[100px] h-[px] top-[420px] left-0">
           <div className="relative h-[101px]">
             <div className="absolute w-[104px] h-[16px] top-[43px] left-[-2px] bg-grass rounded-[20px] rotate-[-27.76deg]" />
             <div className="absolute w-[90px] h-[16px] top-[30px] left-[-2px] bg-grass rounded-[20px] rotate-[65.00deg]" />
           </div>
         </div>
         <div className="absolute w-[100px] h-[101px] top-[288px] left-[494px] rotate-[-30.11deg]">
           <div className="relative h-[101px]">
             <div className="absolute w-[104px] h-[16px] top-[43px] left-[-2px] bg-grass rounded-[20px] rotate-[-27.76deg]" />
             <div className="absolute w-[104px] h-[16px] top-[43px] left-[-2px] bg-grass rounded-[20px] rotate-[65.00deg]" />
           </div>
         </div>
         <div className="absolute w-[52px] h-[53px] top-[165px] left-[84px] rotate-[-30.11deg]">
           <div className="relative h-[53px]">
             <div className="absolute w-[54px] h-[8px] top-[22px] -left-px bg-grass rounded-[20px] rotate-[-27.76deg]" />
             <div className="absolute w-[54px] h-[8px] top-[22px] -left-px bg-grass rounded-[20px] rotate-[65.00deg]" />
           </div>
         </div>
         <div className="absolute w-[52px] h-[53px] top-[70px] left-[564px] rotate-[-11.75deg]">
           <div className="relative h-[53px]">
             <div className="absolute w-[54px] h-[8px] top-[22px] -left-px bg-grass rounded-[20px] rotate-[-27.76deg]" />
             <div className="absolute w-[54px] h-[8px] top-[22px] -left-px bg-grass rounded-[20px] rotate-[65.00deg]" />
           </div>
         </div>
         <div className="absolute w-[46px] h-[41px] top-[300px] left-[171px]">
           <div className="w-[32px] h-[32px] top-[5px] left-0 rounded-[16px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-0 left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[16px] left-[37px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[32px] left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
         </div>
         <div className="absolute w-[46px] h-[41px] top-[341px] left-[247px]">
           <div className="w-[32px] h-[32px] top-[5px] left-0 rounded-[16px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-0 left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[16px] left-[37px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[32px] left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
         </div>
         <div className="absolute w-[46px] h-[41px] top-[300px] left-[325px]">
           <div className="w-[32px] h-[32px] top-[5px] left-0 rounded-[16px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-0 left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[16px] left-[37px] rounded-[4.5px] absolute bg-[#90d17d]" />
           <div className="w-[9px] h-[9px] top-[32px] left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
         </div>
         <div className="absolute w-[46px] h-[41px] top-[332px] left-[403px]">
          <div className="w-[32px] h-[32px] top-[5px] left-0 rounded-[16px] absolute bg-[#90d17d]" />
          <div className="w-[9px] h-[9px] top-0 left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
          <div className="w-[9px] h-[9px] top-[16px] left-[37px] rounded-[4.5px] absolute bg-[#90d17d]" />
          <div className="w-[9px] h-[9px] top-[32px] left-[32px] rounded-[4.5px] absolute bg-[#90d17d]" />
        </div>
        <div className="absolute top-[350px] left-[280px]">
        <button class="w-fit px-5 py-3 mt-6 max-sm:mt-3 text-shining text-sm font-medium text-white bg-grass rounded-md hover:bg-[#3C5D1A] transition-all focus:outline-none focus:ring"
              onClick={() => router.push('/')} style={{position: 'relative', top: '50px'}}>Go back to Login</button>
        </div>
        </div>
      </div>
      </div>
  ) 
}