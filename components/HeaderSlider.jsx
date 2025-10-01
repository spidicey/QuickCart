import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

const HeaderSlider = () => {
  const { lookbooks, router } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Transform lookbooks into slider data format
  const sliderData = lookbooks.length > 0 
    ? lookbooks.map(lookbook => ({
        id: lookbook.lookbookId,
        title: lookbook.title,
        description: lookbook.description,
        slug: lookbook.slug,
        imgSrc: lookbook.image,
        itemCount: lookbook.items?.length || 0
      }))
    : [
        // Fallback static data if no lookbooks available
        {
          id: 1,
          title: "Experience Pure Sound - Your Perfect Headphones Awaits!",
          description: "Limited Time Offer 30% Off",
          imgSrc: assets.header_headphone_image,
        },
        {
          id: 2,
          title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
          description: "Hurry up only few lefts!",
          imgSrc: assets.header_playstation_image,
        },
        {
          id: 3,
          title: "Power Meets Elegance - Apple MacBook Pro is Here for you!",
          description: "Exclusive Deal 40% Off",
          imgSrc: assets.header_macbook_image,
        },
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleShopNow = (id) => {
    console.log("Navigating to lookbook:", id);
      router.push(`/lookbook/${id}`);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">
                {slide.description}
              </p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>
              {slide.itemCount > 0 && (
                <p className="text-gray-600 mt-2">
                  {slide.itemCount} sản phẩm trong bộ sưu tập
                </p>
              )}
              <div className="flex items-center mt-4 md:mt-6">
                {slide.slug ? (
                  <>
                    <button 
                      onClick={() => handleShopNow(slide.id)}
                      className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition"
                    >
                      Mua ngay
                    </button>
                    <Link 
                      href={`/lookbook/${slide.id}`}
                      className="group flex items-center gap-2 px-6 py-2.5 font-medium"
                    >
                      Xem thêm
                      <Image 
                        className="group-hover:translate-x-1 transition" 
                        src={assets.arrow_icon} 
                        alt="arrow_icon" 
                      />
                    </Link>
                  </>
                ) : (
                  <>
                    <button className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium">
                      Mua ngay
                    </button>
                    <button className="group flex items-center gap-2 px-6 py-2.5 font-medium">
                      Xem thêm
                      <Image 
                        className="group-hover:translate-x-1 transition" 
                        src={assets.arrow_icon} 
                        alt="arrow_icon" 
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-full md:h-72 w-48 object-cover rounded-lg"
                src={slide.imgSrc}
                alt={slide.title}
                width={800}
                height={400}
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer transition ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;