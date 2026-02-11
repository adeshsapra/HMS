import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const SectionHeading = ({ children, desc, align = "center" }: { children: React.ReactNode; desc?: string; align?: "left" | "center" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    const isLeft = align === "left";

    return (
        <div ref={ref} className={`mb-5 ${isLeft ? "" : "container"}`}>
            <motion.div style={{ scale, opacity }} className={isLeft ? "text-start" : "text-center"}>
                <h2 className="display-6 fw-bold" style={{ color: "var(--heading-color)" }}>
                    {children}
                </h2>
                {desc && (
                    <p className={`text-muted mt-3 ${isLeft ? "" : "mx-auto"}`} style={{ maxWidth: "600px" }}>
                        {desc}
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default SectionHeading;
