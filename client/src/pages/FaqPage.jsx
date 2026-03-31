import React, { useState, useRef } from "react";
import { ChevronDown, HelpCircle, Zap, CreditCard, Wifi, Lock, AlertCircle, FileUp } from "lucide-react";

const faqs = [
  {
    icon: Zap,
    question: "Transaction debited but not reflected in beneficiary account",
    steps: [
      "Wait for 5–10 minutes as some transactions may take time to process.",
      "Check the transaction status in your bank statement or transaction history.",
      "If the amount is still not credited after 30 minutes, raise a ticket with the transaction ID."
    ]
  },
  {
    icon: Lock,
    question: "Unable to login to internet banking",
    steps: [
      "Ensure your username and password are entered correctly.",
      "Try resetting your password using the 'Forgot Password' option.",
      "If the issue persists, raise a support ticket for account verification."
    ]
  },
  {
    icon: AlertCircle,
    question: "ATM withdrawal failed but money debited",
    steps: [
      "Wait for up to 24 hours as failed ATM transactions are usually auto-reversed.",
      "Check your account balance after some time.",
      "If the amount is not reversed within 24 hours, raise a ticket with ATM location and transaction details."
    ]
  },
  {
    icon: CreditCard,
    question: "Credit/Debit card blocked or declined during payment",
    steps: [
      "Check if your card is temporarily blocked due to multiple incorrect PIN attempts.",
      "Ensure your card has not expired and has sufficient balance or credit limit.",
      "If the card is still not working, raise a support ticket for card verification."
    ]
  },
  {
    icon: Wifi,
    question: "UPI payment pending or stuck",
    steps: [
      "Check the UPI app to see if the transaction status is pending.",
      "Pending transactions usually resolve automatically within a few minutes.",
      "If the amount is debited but not credited after some time, raise a ticket with the UPI reference ID."
    ]
  },
  {
    icon: FileUp,
    question: "Unable to upload documents while raising a ticket",
    steps: [
      "Ensure the file size is within the allowed limit (under 5MB).",
      "Check that the file format is supported (PDF, JPG, PNG).",
      "Try uploading again or refresh the page before submitting the ticket."
    ]
  }
];

const FAQItem = ({ faq, index, openIndex, setOpenIndex }) => {
  const isOpen = openIndex === index;
  const Icon = faq.icon;

  return (
    <div
      className="rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        background: isOpen
          ? "linear-gradient(135deg, #1a3f7a 0%, #2d5fad 100%)"
          : "#ffffff",
        borderColor: isOpen ? "#2d5fad" : "#dce8fd",
        boxShadow: isOpen
          ? "0 4px 20px rgba(45,95,173,0.25)"
          : "0 1px 4px rgba(147,182,245,0.1)",
        transform: isOpen ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Question Row */}
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left focus:outline-none"
      >
        {/* Icon badge */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-300"
          style={{
            background: isOpen
              ? "rgba(147,182,245,0.2)"
              : "linear-gradient(135deg, #93b6f5 0%, #6b9ef0 100%)",
            boxShadow: isOpen ? "none" : "0 2px 6px rgba(147,182,245,0.4)",
          }}
        >
          <Icon
            size={16}
            style={{ color: isOpen ? "#93b6f5" : "#ffffff" }}
          />
        </div>

        {/* Text */}
        <span
          className="flex-1 text-sm font-semibold leading-snug transition-colors duration-300"
          style={{ color: isOpen ? "#e8f0fe" : "#1a3f7a" }}
        >
          {faq.question}
        </span>

        {/* Chevron */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
          style={{
            background: isOpen ? "rgba(147,182,245,0.15)" : "#f0f6ff",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown
            size={14}
            style={{ color: isOpen ? "#93b6f5" : "#2d5fad" }}
          />
        </div>
      </button>

      {/* Expandable Steps */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-5 pb-5">
          {/* Divider */}
          <div
            className="mb-4 h-px w-full"
            style={{ background: "rgba(147,182,245,0.25)" }}
          />

          <ul className="space-y-3">
            {faq.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: "rgba(147,182,245,0.2)",
                    color: "#93b6f5",
                    border: "1px solid rgba(147,182,245,0.4)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "#c3d9fc" }}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="py-2 px-1 bank-scrollbar">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #2d5fad 0%, #1a3f7a 100%)",
            boxShadow: "0 4px 20px rgba(45,95,173,0.3)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(147,182,245,0.2)", border: "1px solid rgba(147,182,245,0.3)" }}
          >
            <HelpCircle size={22} style={{ color: "#93b6f5" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#93b6f5" }}>
              Quick answers to common banking issues
            </p>
          </div>
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