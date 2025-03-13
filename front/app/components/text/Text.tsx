import React, { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  type?: "title" | "subtitle";
}

const Heading: React.FC<HeadingProps> = ({ children, type = "title" }) => {
  const isTitle = type === "title";

  return (
    <div className="text-center w-full">
      {isTitle ? (
        <h1 className="text-2xl font-bold text-black">{children}</h1>
      ) : (
        <h2 className="text-sm font-semibold text-gray-700">{children}</h2>
      )}
      <hr
        className={`mt-2 ${
          isTitle
            ? "border-gray-600 w-[360px] mx-auto mb-4"
            : "border-gray-400 w-[260px] mx-auto mb-2"
        }`}
      />
    </div>
  );
};

export default Heading;
