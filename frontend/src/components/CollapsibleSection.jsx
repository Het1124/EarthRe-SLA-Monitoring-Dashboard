
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function CollapsibleSection({ title, children, defaultOpen = true }) {

  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (

    <section className="mb-6 rounded-xl bg-white shadow-sm">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left"
      >

        <h2 className="text-xl font-semibold text-slate-800">
          {title}
        </h2>

        {isOpen ? (
          <ChevronUp size={22} className="text-slate-500" />
        ) : (
          <ChevronDown size={22} className="text-slate-500" />
        )}

      </button>

      {isOpen && (

        <div className="px-5 pb-5">
          {children}
        </div>

      )}

    </section>

  );

}

export default CollapsibleSection;
