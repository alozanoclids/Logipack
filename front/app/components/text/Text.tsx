import React, { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  type?: "title" | "subtitle" | "error" | "alert";
}

const Heading: React.FC<HeadingProps> = ({ children, type = "title" }) => {
  let headingElement;
  let underlineStyle;

  switch (type) {
    case "title":
      headingElement = <h1 className="text-2xl font-bold text-black">{children}</h1>;
      underlineStyle = "border-gray-400 w-full sm:max-w-[260px] mx-auto mb-2 hover:border-blue-500 transition-colors duration-200";
      break;
    case "subtitle":
      headingElement = <h2 className="text-sm font-semibold text-gray-700">{children}</h2>;
      underlineStyle = "border-gray-400 w-full sm:max-w-[260px] mx-auto mb-2 hover:border-blue-500 transition-colors duration-200";
      break;
    case "error":
      headingElement = <h3 className="text-sm font-semibold text-red-700">{children}</h3>;
      underlineStyle = "border-gray-400 w-full sm:max-w-[260px] mx-auto mb-2 hover:border-blue-500 transition-colors duration-200";
      break;
    case "alert":
      headingElement = <h3 className="text-sm font-semibold text-[#ffb428]">{children}</h3>;
      underlineStyle = "border-gray-400 w-full sm:max-w-[260px] mx-auto mb-2 hover:border-blue-500 transition-colors duration-200";
      break;
    default:
      headingElement = <h1 className="text-2xl font-bold text-black">{children}</h1>;
      underlineStyle = "border-gray-400 w-full sm:max-w-[260px] mx-auto mb-2 hover:border-blue-500 transition-colors duration-200";
  }

  return (
    <div className="text-center w-full">
      {headingElement}
      <hr className={`mt-2 ${underlineStyle}`} />
    </div>
  );
};

export default Heading;
