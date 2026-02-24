import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Ticket not getting assigned to any team",
    steps: [
      "Ensure the correct category and priority are selected while creating the ticket.",
      "If still unassigned, contact admin to manually forward the ticket."
    ]
  },
  {
    question: "Unable to upload attachment",
    steps: [
      "Check if file size is within allowed limit (e.g., under 5MB).",
      "Ensure the file format is supported (PDF, JPG, PNG, DOC)."
    ]
  },
  {
    question: "Ticket stuck in Initiated status",
    steps: [
      "Admin must review and either forward or resolve the ticket.",
      "If delay continues, follow up with support team."
    ]
  },
  {
    question: "Ticket marked resolved but issue still exists",
    steps: [
      "Create a new ticket referencing the previous ticket ID.",
      "Provide additional screenshots or detailed explanation."
    ]
  }
];

const FAQItem = ({ faq, index, openIndex, setOpenIndex }) => {
  const isOpen = openIndex === index;
  const contentRef = useRef(null);

  const toggle = () => {
    setOpenIndex(isOpen ? null : index);
  };

  return (
    <div
      className="group bg-white rounded-lg border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
    >
      {/* Question */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <h3 className="text-[0.95rem] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {faq.question}
        </h3>

        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-blue-600 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
        )}
      </button>

      {/* Smooth Expand Section */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-3 text-sm text-gray-600">
          {faq.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Common ticket issues and simple solutions.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              openIndex={openIndex}
              setOpenIndex={setOpenIndex}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQPage;