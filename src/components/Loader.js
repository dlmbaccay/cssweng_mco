
export default function Loader({ show }) {
  return show ? (
    <div className="bg-gradient-to-br from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center flex flex-col space-y-10 p-80
            lg:flex-row lg:space-x-20 lg:py-10
            md:space-x-14 md:py-10
            sm:space-x-10 sm:py-10">
    </div>
  ) : null;
}
