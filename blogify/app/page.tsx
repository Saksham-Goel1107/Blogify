"use client"
import {useEffect, useState} from "react"
import Link from "next/link";
import RealTimeStars from "./Components/RealTimeStars";
import Feedback from "./Components/feedback";
import { getRatingStats } from "./actions/rating";
import FAQ from "./Components/FAQ";

export default function Home() {
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, count: 0 });

  useEffect(() => {
    async function fetchRatingStats() {
      const stats = await getRatingStats();
      setRatingStats(stats);
    }
    
    fetchRatingStats();
  }, []);

  return (
    <>
      <div className="text-center font-extrabold text-4xl text-white">Blogify</div>
      <p className="text-white text-center font-bold mt-2 text-xl">Share Your Thoughts With The World</p>
      <div className="flex gap-3 pt-5 justify-center">
        <Link
          href="/Posts" 
          className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:outline-none rounded-full text-lg px-5 py-2 cursor-pointer font-bold hover:scale-105"
        >
          Get Started
        </Link>
        <a
          href="https://github.com/Saksham-Goel1107/Blogify" 
          target="_blank"
          className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:outline-none rounded-full text-lg px-5 py-2 cursor-pointer font-bold hover:scale-105"
        >
          Github Repo
        </a>
      </div>
      <RealTimeStars initialRating={ratingStats.averageRating} initialCount={ratingStats.count} />
      <Feedback />
      <div className="max-w-[90vw] mx-auto"><FAQ/></div>
      
    </>
  );
}
