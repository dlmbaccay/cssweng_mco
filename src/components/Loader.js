
export default function Loader({ show }) {
  return show ? (
    <div className="bg-gradient-to-br from-jasmine via-citron to-[#7DD184] min-w-full min-h-screen flex justify-center items-center">
      <div className="wheel-and-hamster mx-auto mt-10 relative">
        <div className="wheel w-32 h-32 animate-spin-slow bg-gray-300 rounded-full"></div>
        <div className="spoke flex items-center animate-spin-slow"></div>
        <div className="hamster animate-hamster absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="hamster__head bg-yellow-500 rounded-xl">
            <div className="hamster__ear bg-yellow-400 rounded-full"></div>
            <div className="hamster__eye bg-black rounded-full"></div>
            <div className="hamster__nose bg-pink-300 rounded-full"></div>
          </div>
          <div class="hamster__body bg-gray-300 rounded-full">
            <div className="hamster__limb--fr bg-yellow-500"></div>
            <div className="hamster__limb--fl bg-yellow-500"></div>
            <div className="hamster__limb--br bg-yellow-500"></div>
            <div className="hamster__limb--bl bg-yellow-500"></div>
          </div>
          <div className="hamster__tail bg-yellow-500 w-4 h-10 absolute -right-2 top-1/2 transform -translate-y-1/2 rotate-20"></div>
        </div>
      </div>
    </div>
  ) : null;
}
