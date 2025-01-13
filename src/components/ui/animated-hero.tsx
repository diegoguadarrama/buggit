import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Busy Teams", "PMs", "Startups", "You"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-10 lg:py-20 items-center justify-center">
          <div className="flex flex-col gap-4 lg:w-1/2">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center lg:text-left font-regular">
              <span>The Project Management Tool Designed for</span>
              <span className="relative flex w-full justify-center lg:justify-start overflow-hidden text-center lg:text-left md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center lg:text-left">
              Say goodbye to cluttered workflows and disorganized tasks. With Buggit, you'll have everything you need to manage projects effectively, whether you're at your desk or on your mobile device.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
              <Button asChild size="lg">
                <Link to="/signup">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-3xl lg:w-1/2">
            <img
              src="/lovable_uploads/72cc8b57-7f04-4f63-b9ca-1702170cce35.png"
              alt="Hero"
              className="w-full max-w-[600px] h-auto rounded-lg border shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}